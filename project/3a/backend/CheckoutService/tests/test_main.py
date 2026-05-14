from decimal import Decimal
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from main import app


class FakeResponse:
    def __init__(self, status_code=200, json_data=None, should_raise=False):
        self.status_code = status_code
        self._json_data = json_data or {}
        self._should_raise = should_raise

    def json(self):
        return self._json_data

    def raise_for_status(self):
        if self._should_raise or self.status_code >= 400:
            raise RuntimeError(f"HTTP {self.status_code}")


class FakeAsyncClient:
    def __init__(self, responses=None, exceptions=None, calls=None, **kwargs):
        self.responses = responses or {}
        self.exceptions = exceptions or {}
        self.calls = calls if calls is not None else []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def get(self, url, *args, **kwargs):
        self.calls.append(("GET", url, kwargs))
        if "GET" in self.exceptions:
            raise self.exceptions["GET"]
        return self.responses.get("GET", FakeResponse())

    async def post(self, url, *args, **kwargs):
        self.calls.append(("POST", url, kwargs))
        if "POST" in self.exceptions:
            raise self.exceptions["POST"]
        return self.responses.get("POST", FakeResponse())

    async def put(self, url, *args, **kwargs):
        self.calls.append(("PUT", url, kwargs))
        if "PUT" in self.exceptions:
            raise self.exceptions["PUT"]
        return self.responses.get("PUT", FakeResponse())


class CheckoutServiceTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        response = self.client.get("/health")

        self.assertEqual(200, response.status_code)
        self.assertEqual({"status": "UP"}, response.json())

    def test_checkout_without_reservation(self):
        calls = []
        fake_client = FakeAsyncClient(
            responses={
                "POST": FakeResponse(200, {"id": 42}),
            },
            calls=calls,
        )

        payload = {
            "customerId": 10,
            "customerName": "John Doe",
            "restaurantId": 5,
            "restaurantName": "La Parrilla",
            "items": [
                {
                    "menuItemId": "item1",
                    "productName": "Burger",
                    "quantity": 2,
                    "unitPrice": 9.99,
                },
                {
                    "menuItemId": "item2",
                    "productName": "Fries",
                    "quantity": 1,
                    "unitPrice": 4.50,
                },
            ],
            "paymentMethod": "CARD",
        }

        with patch("main.httpx.AsyncClient", return_value=fake_client):
            response = self.client.post("/api/checkout", json=payload)

        body = response.json()
        self.assertEqual(200, response.status_code)
        self.assertEqual(42, body["orderId"])
        self.assertIsNone(body["reservationId"])
        self.assertEqual(Decimal("24.48"), Decimal(str(body["total"])))
        self.assertEqual("Preparing", body["status"])
        self.assertEqual("CARD", body["paymentMethod"])
        self.assertEqual(["POST"], [call[0] for call in calls])

    def test_checkout_with_reservation_links_order(self):
        calls = []
        fake_client = FakeAsyncClient(
            responses={
                "GET": FakeResponse(200, {"id": 100}),
                "POST": FakeResponse(200, {"id": 99}),
                "PUT": FakeResponse(200, {"ok": True}),
            },
            calls=calls,
        )

        payload = {
            "customerId": 10,
            "customerName": "John Doe",
            "restaurantId": 5,
            "restaurantName": "La Parrilla",
            "reservationId": 100,
            "items": [
                {
                    "menuItemId": "item1",
                    "productName": "Burger",
                    "quantity": 1,
                    "unitPrice": 9.99,
                }
            ],
        }

        with patch("main.httpx.AsyncClient", return_value=fake_client):
            response = self.client.post("/api/checkout", json=payload)

        self.assertEqual(200, response.status_code)
        self.assertEqual(["GET", "POST", "PUT"], [call[0] for call in calls])
        self.assertEqual(100, response.json()["reservationId"])

    def test_checkout_rejects_unknown_reservation(self):
        fake_client = FakeAsyncClient(
            responses={
                "GET": FakeResponse(404, {"detail": "not found"}),
            }
        )

        payload = {
            "customerId": 10,
            "customerName": "John Doe",
            "restaurantId": 5,
            "restaurantName": "La Parrilla",
            "reservationId": 999,
            "items": [
                {
                    "menuItemId": "item1",
                    "productName": "Burger",
                    "quantity": 1,
                    "unitPrice": 9.99,
                }
            ],
        }

        with patch("main.httpx.AsyncClient", return_value=fake_client):
            response = self.client.post("/api/checkout", json=payload)

        self.assertEqual(400, response.status_code)
        self.assertEqual("Reservation not found: 999", response.json()["detail"])

    def test_checkout_returns_502_when_order_creation_fails(self):
        fake_client = FakeAsyncClient(
            exceptions={
                "POST": RuntimeError("Connection refused"),
            }
        )

        payload = {
            "customerId": 10,
            "customerName": "John Doe",
            "restaurantId": 5,
            "restaurantName": "La Parrilla",
            "items": [
                {
                    "menuItemId": "item1",
                    "productName": "Burger",
                    "quantity": 1,
                    "unitPrice": 9.99,
                }
            ],
        }

        with patch("main.httpx.AsyncClient", return_value=fake_client):
            response = self.client.post("/api/checkout", json=payload)

        self.assertEqual(502, response.status_code)
        self.assertEqual(
            "Failed to create order. Please try again.",
            response.json()["detail"],
        )


if __name__ == "__main__":
    unittest.main()
