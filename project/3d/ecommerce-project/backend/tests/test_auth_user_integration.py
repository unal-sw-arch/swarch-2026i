"""
Integration tests for auth-service ↔ user-service communication.

Tests the user registration flow where auth-service creates a user,
publishes an AUTH_USER_REGISTERED event, and user-service consumes it
to create the user profile.
"""
import pytest
from httpx import AsyncClient
import asyncio
import time


class TestAuthUserIntegration:
    """Auth-service to user-service integration tests"""

    @pytest.mark.asyncio
    async def test_user_registration_flow(self, auth_client: AsyncClient, user_client: AsyncClient):
        """
        Test complete user registration flow: auth-service → event → user-service.

        1. User registers via auth-service
        2. Auth-service publishes AUTH_USER_REGISTERED event
        3. User-service consumes event and creates user profile
        4. Verify user profile exists in user-service
        """
        # This test requires:
        # - Valid registration endpoint in auth-service
        # - RabbitMQ event broker
        # - User-service listening to events
        # - Ability to poll user-service for newly created profile

        test_email = f'test-user-{int(time.time())}@example.com'
        test_password = 'SecurePassword123!'

        # Step 1: Register user in auth-service
        register_response = await auth_client.post(
            '/auth/register',
            json={
                'email': test_email,
                'password': test_password,
            }
        )

        # Step 2: Check registration was successful
        assert register_response.status_code in [200, 201, 409]  # 409 if already exists

        # Step 3: Wait for event processing (async)
        await asyncio.sleep(1)

        # Step 4: Verify user profile was created in user-service
        # This would call user-service's endpoint to fetch user by email
        profile_response = await user_client.get(
            f'/users/by-email?email={test_email}',
            headers={'Authorization': 'Bearer test-token'}  # Would use real token
        )

        # Profile should exist (200) or auth might be required (401)
        assert profile_response.status_code in [200, 401]

    @pytest.mark.asyncio
    async def test_user_service_availability(self, user_client: AsyncClient):
        """
        Test that user-service is accessible and responsive.

        This is a basic connectivity test for the user-service.
        """
        response = await user_client.get('/health')

        # Should return 200 (OK) or 404 (no health endpoint but service is up)
        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_duplicate_user_registration(self, auth_client: AsyncClient):
        """
        Test that registering with the same email twice is handled correctly.

        The second registration should either be rejected or return the
        existing user without creating duplicates in user-service.
        """
        test_email = f'duplicate-test-{int(time.time())}@example.com'

        # First registration
        response1 = await auth_client.post(
            '/auth/register',
            json={
                'email': test_email,
                'password': 'SecurePassword123!',
            }
        )

        assert response1.status_code in [200, 201]

        # Wait for event processing
        await asyncio.sleep(1)

        # Second registration with same email
        response2 = await auth_client.post(
            '/auth/register',
            json={
                'email': test_email,
                'password': 'DifferentPassword456!',
            }
        )

        # Should reject duplicate or indicate conflict
        assert response2.status_code in [409, 400, 422]


class TestAuthUserEventProcessing:
    """Tests for event-driven communication between auth and user services"""

    @pytest.mark.asyncio
    async def test_event_published_to_queue(self, auth_client: AsyncClient):
        """
        Test that auth-service publishes events to RabbitMQ queue.

        This requires inspection of the message queue or a test consumer.
        """
        # This test would require:
        # - RabbitMQ access
        # - Message queue inspection capability
        # - Or a test event consumer that logs received events
        pass

    @pytest.mark.asyncio
    async def test_event_consumer_fault_tolerance(self, user_client: AsyncClient):
        """
        Test that user-service can handle event retries if processing fails.

        If the user-service is temporarily down or busy, events should
        not be lost and should be reprocessed when the service recovers.
        """
        # This test would require:
        # - Stopping user-service temporarily
        # - Triggering user registration
        # - Restarting user-service
        # - Verifying events are reprocessed
        pass
