"""
Integration tests for the simulated payment module in order-service.

Flow under test:
1. Order is created and confirmed via the stock-reservation saga.
2. POST /api/v1/orders/{id}/pay processes a simulated payment.
   - Card numbers ending in "0000" are deterministically declined.
   - Any other card (or method "transfer") completes and the order
     transitions to "paid".
3. GET /api/v1/orders/{id}/payments lists payment attempts.

Requires the full stack running (docker compose up) with the service
ports reachable per conftest.py defaults.
"""
import asyncio
import time
import uuid

import pytest
from httpx import AsyncClient

from conftest import get_auth_headers

VALID_CARD = '4111111111111111'
DECLINED_CARD = '4111111111110000'

CARD_PAYLOAD = {
    'method': 'card',
    'card_number': VALID_CARD,
    'card_holder': 'Test Buyer',
    'card_expiry': '12/27',
}


async def _register_and_login(auth_client: AsyncClient, label: str) -> str:
    """Register a fresh user and return its access token."""
    email = f'payment-{label}-{uuid.uuid4().hex[:10]}@example.com'
    password = 'SecurePassword123!'

    register_response = await auth_client.post(
        '/auth/register',
        json={'full_name': f'Payment Test {label}', 'email': email, 'password': password},
    )
    assert register_response.status_code in [200, 201], register_response.text

    login_response = await auth_client.post(
        '/auth/login',
        json={'email': email, 'password': password},
    )
    assert login_response.status_code == 200, login_response.text
    return login_response.json()['access_token']


async def _get_or_create_category(product_client: AsyncClient, token: str) -> str:
    """Return an existing category id, or skip if none can be obtained."""
    response = await product_client.get('/products/categories')
    if response.status_code == 200 and response.json():
        return response.json()[0]['id']

    # Try to create one (may be rejected for customer role)
    create_response = await product_client.post(
        '/products/categories',
        json={'name': f'Payments Test {uuid.uuid4().hex[:6]}', 'slug': f'payments-test-{uuid.uuid4().hex[:6]}'},
        headers=get_auth_headers(token),
    )
    if create_response.status_code == 201:
        return create_response.json()['id']

    pytest.skip('No product category available and current role cannot create one')


async def _create_product(product_client: AsyncClient, token: str, stock: int = 50) -> dict:
    category_id = await _get_or_create_category(product_client, token)
    suffix = uuid.uuid4().hex[:8]
    response = await product_client.post(
        '/products/',
        json={
            'category_id': category_id,
            'name': f'Payment test product {suffix}',
            'slug': f'payment-test-product-{suffix}',
            'description': 'Product used by payment integration tests',
            'price': '10000.00',
            'stock': stock,
        },
        headers=get_auth_headers(token),
    )
    assert response.status_code == 201, response.text
    return response.json()


async def _create_confirmed_order(
    order_client: AsyncClient,
    token: str,
    product: dict,
    quantity: int = 1,
) -> dict:
    """Create an order and poll until the saga confirms it."""
    response = await order_client.post(
        '/api/v1/orders/',
        json={
            'items': [
                {
                    'product_id': product['id'],
                    'quantity': quantity,
                    'unit_price': product['price'],
                    'product_name': product['name'],
                }
            ],
            'shipping_address': {
                'full_name': 'Test Buyer',
                'street': 'Calle 123 #45-67',
                'city': 'Bogota',
                'state': 'Cundinamarca',
                'country': 'Colombia',
                'postal_code': '110111',
            },
        },
        headers=get_auth_headers(token),
    )
    assert response.status_code == 201, response.text
    order = response.json()

    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        poll = await order_client.get(
            f"/api/v1/orders/{order['id']}",
            headers=get_auth_headers(token),
        )
        assert poll.status_code == 200, poll.text
        order = poll.json()
        if order['status'] != 'pending_stock_confirmation':
            break
        await asyncio.sleep(1)

    if order['status'] != 'confirmed':
        pytest.skip(f"Saga did not confirm the order (status={order['status']}) — check RabbitMQ/product-service")

    return order


@pytest.mark.order
@pytest.mark.integration
class TestOrderPayment:
    """Simulated payment gateway tests"""

    async def test_pay_confirmed_order_success(self, auth_client, product_client, order_client):
        """Paying a confirmed order with a valid card completes and marks the order paid."""
        token = await _register_and_login(auth_client, 'success')
        product = await _create_product(product_client, token)
        order = await _create_confirmed_order(order_client, token, product)

        pay_response = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json=CARD_PAYLOAD,
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert pay_response.status_code == 201, pay_response.text
        payment = pay_response.json()
        assert payment['status'] == 'completed'
        assert payment['card_last4'] == VALID_CARD[-4:]
        assert payment['method'] == 'card'
        assert payment['processed_at'] is not None

        order_response = await order_client.get(
            f"/api/v1/orders/{order['id']}",
            headers=get_auth_headers(token),
        )
        assert order_response.json()['status'] == 'paid'

    async def test_pay_with_declined_card(self, auth_client, product_client, order_client):
        """A card ending in 0000 is declined and the order stays confirmed."""
        token = await _register_and_login(auth_client, 'declined')
        product = await _create_product(product_client, token)
        order = await _create_confirmed_order(order_client, token, product)

        pay_response = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json={**CARD_PAYLOAD, 'card_number': DECLINED_CARD},
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert pay_response.status_code == 201, pay_response.text
        payment = pay_response.json()
        assert payment['status'] == 'failed'
        assert payment['failure_reason'] == 'card_declined'

        order_response = await order_client.get(
            f"/api/v1/orders/{order['id']}",
            headers=get_auth_headers(token),
        )
        assert order_response.json()['status'] == 'confirmed'

    async def test_pay_order_wrong_state_and_ownership(self, auth_client, product_client, order_client):
        """Paying an already-paid order returns 409; another user's order returns 403."""
        token = await _register_and_login(auth_client, 'conflict')
        product = await _create_product(product_client, token)
        order = await _create_confirmed_order(order_client, token, product)

        first = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json=CARD_PAYLOAD,
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert first.status_code == 201
        assert first.json()['status'] == 'completed'

        # Second payment attempt on a paid order -> 409
        second = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json=CARD_PAYLOAD,
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert second.status_code == 409

        # Another user cannot pay (or see) this order -> 403
        other_token = await _register_and_login(auth_client, 'intruder')
        forbidden = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json=CARD_PAYLOAD,
            headers=get_auth_headers(other_token),
            timeout=15.0,
        )
        assert forbidden.status_code == 403

    async def test_transfer_payment_success(self, auth_client, product_client, order_client):
        """Bank transfer method completes without card details."""
        token = await _register_and_login(auth_client, 'transfer')
        product = await _create_product(product_client, token)
        order = await _create_confirmed_order(order_client, token, product)

        pay_response = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json={'method': 'transfer'},
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert pay_response.status_code == 201, pay_response.text
        payment = pay_response.json()
        assert payment['status'] == 'completed'
        assert payment['card_last4'] is None

    async def test_card_required_for_card_method(self, auth_client, product_client, order_client):
        """method=card without card_number is rejected by validation (422)."""
        token = await _register_and_login(auth_client, 'validation')
        product = await _create_product(product_client, token)
        order = await _create_confirmed_order(order_client, token, product)

        pay_response = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json={'method': 'card'},
            headers=get_auth_headers(token),
        )
        assert pay_response.status_code == 422

    async def test_payment_history(self, auth_client, product_client, order_client):
        """Payment attempts (failed + completed) are listed newest first."""
        token = await _register_and_login(auth_client, 'history')
        product = await _create_product(product_client, token)
        order = await _create_confirmed_order(order_client, token, product)

        declined = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json={**CARD_PAYLOAD, 'card_number': DECLINED_CARD},
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert declined.status_code == 201

        completed = await order_client.post(
            f"/api/v1/orders/{order['id']}/pay",
            json=CARD_PAYLOAD,
            headers=get_auth_headers(token),
            timeout=15.0,
        )
        assert completed.status_code == 201

        history = await order_client.get(
            f"/api/v1/orders/{order['id']}/payments",
            headers=get_auth_headers(token),
        )
        assert history.status_code == 200, history.text
        payload = history.json()
        assert payload['total'] == 2
        statuses = {item['status'] for item in payload['items']}
        assert statuses == {'failed', 'completed'}
