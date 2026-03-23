from unittest.mock import Mock, patch

from django.test import SimpleTestCase
from rest_framework.test import APIClient

from activities.domain.validators import DomainValidationError
from activities.infrastructure.exceptions import InfrastructureError


class ActivityHTTPViewsTests(SimpleTestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("activities.interfaces.http.views.build_record_activity_event_use_case")
    def test_post_activities_returns_201_for_valid_payload(self, mock_builder):
        mock_use_case = Mock()
        mock_use_case.execute.return_value = {
            "id": "mocked-event-id",
            "status": "RECORDED",
        }
        mock_builder.return_value = mock_use_case

        payload = {
            "eventType": "ORDER_CREATED",
            "entityType": "ORDER",
            "entityId": "5001",
            "restaurantId": 1,
            "orderId": "5001",
            "timestamp": "2026-03-14T21:10:00Z",
            "sourceService": "order-service",
            "payload": {
                "status": "CREATED"
            },
        }

        response = self.client.post("/activities", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(
            response.json(),
            {
                "id": "mocked-event-id",
                "status": "RECORDED",
            },
        )
        mock_use_case.execute.assert_called_once()

    @patch("activities.interfaces.http.views.build_record_activity_event_use_case")
    def test_post_activities_status_changed_in_preparation_is_valid(self, mock_builder):
        mock_use_case = Mock()
        mock_use_case.execute.return_value = {
            "id": "mocked-event-id",
            "status": "RECORDED",
        }
        mock_builder.return_value = mock_use_case

        payload = {
            "eventType": "ORDER_STATUS_CHANGED",
            "entityType": "ORDER",
            "entityId": "5001",
            "restaurantId": 1,
            "orderId": "5001",
            "timestamp": "2026-03-14T21:10:00Z",
            "sourceService": "order-service",
            "payload": {
                "status": "IN_PREPARATION"
            },
        }

        response = self.client.post("/activities", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(
            response.json(),
            {
                "id": "mocked-event-id",
                "status": "RECORDED",
            },
        )
        mock_use_case.execute.assert_called_once()

    def test_post_activities_returns_400_for_invalid_payload(self):
        payload = {
            "eventType": "ORDER_CREATED",
            "entityType": "ORDER",
            "entityId": "5001",
            "restaurantId": 1,
            "timestamp": "2026-03-14T21:10:00Z",
            "sourceService": "order-service",
            "payload": {
                "status": "CREATED"
            },
        }

        response = self.client.post("/activities", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response["Content-Type"], "application/json")
        body = response.json()
        self.assertEqual(
            body,
            {
                "code": "INVALID_EVENT",
                "message": "Invalid activity event payload",
            },
        )
        self.assertNotIn("errors", body)

    @patch("activities.interfaces.http.views.build_record_activity_event_use_case")
    def test_post_activities_returns_503_when_infrastructure_fails(self, mock_builder):
        mock_use_case = Mock()
        mock_use_case.execute.side_effect = InfrastructureError("Mongo unavailable")
        mock_builder.return_value = mock_use_case

        payload = {
            "eventType": "ORDER_CREATED",
            "entityType": "ORDER",
            "entityId": "5001",
            "restaurantId": 1,
            "orderId": "5001",
            "timestamp": "2026-03-14T21:10:00Z",
            "sourceService": "order-service",
            "payload": {
                "status": "CREATED"
            },
        }

        response = self.client.post("/activities", payload, format="json")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response["Content-Type"], "application/json")
        body = response.json()
        self.assertEqual(
            body,
            {
                "code": "INTERNAL_ERROR",
                "message": "A persistence error occurred",
            },
        )
        self.assertNotIn("errors", body)

    @patch("activities.interfaces.http.views.build_record_activity_event_use_case")
    def test_post_activities_returns_400_when_domain_validation_fails(self, mock_builder):
        mock_use_case = Mock()
        mock_use_case.execute.side_effect = DomainValidationError(
            "order_id is required when entity_type is ORDER"
        )
        mock_builder.return_value = mock_use_case

        payload = {
            "eventType": "ORDER_CREATED",
            "entityType": "ORDER",
            "entityId": "5001",
            "restaurantId": 1,
            "orderId": "5001",
            "timestamp": "2026-03-14T21:10:00Z",
            "sourceService": "order-service",
            "payload": {
                "status": "CREATED"
            },
        }

        response = self.client.post("/activities", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response["Content-Type"], "application/json")
        body = response.json()
        self.assertEqual(
            body,
            {
                "code": "INVALID_EVENT",
                "message": "order_id is required when entity_type is ORDER",
            },
        )
        self.assertNotIn("errors", body)

    @patch("activities.interfaces.http.views.build_get_order_activity_history_use_case")
    def test_get_order_history_returns_200(self, mock_builder):
        mock_use_case = Mock()
        mock_use_case.execute.return_value = {
            "orderId": "5001",
            "events": [
                {
                    "id": "evt-1",
                    "eventType": "ORDER_CREATED",
                    "entityType": "ORDER",
                    "entityId": "5001",
                    "restaurantId": 1,
                    "orderId": "5001",
                    "timestamp": "2026-03-14T21:10:00Z",
                    "sourceService": "order-service",
                    "payload": {"status": "CREATED"},
                }
            ],
        }
        mock_builder.return_value = mock_use_case

        response = self.client.get("/activities/order/5001")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "application/json")
        self.assertEqual(response.json()["orderId"], "5001")
        self.assertEqual(len(response.json()["events"]), 1)
        mock_use_case.execute.assert_called_once_with("5001")

    @patch("activities.interfaces.http.views.build_get_order_activity_history_use_case")
    def test_get_order_history_returns_503_when_infrastructure_fails(self, mock_builder):
        mock_use_case = Mock()
        mock_use_case.execute.side_effect = InfrastructureError("Mongo unavailable")
        mock_builder.return_value = mock_use_case

        response = self.client.get("/activities/order/5001")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response["Content-Type"], "application/json")
        body = response.json()
        self.assertEqual(
            body,
            {
                "code": "INTERNAL_ERROR",
                "message": "A persistence error occurred",
            },
        )
        self.assertNotIn("errors", body)