from django.test import SimpleTestCase

from activities.interfaces.http.serializers import ActivityEventSerializer


class ActivityEventSerializerTests(SimpleTestCase):
    def test_order_status_changed_in_preparation_is_accepted(self):
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

        serializer = ActivityEventSerializer(data=payload)

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_order_event_payload_is_accepted(self):
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

        serializer = ActivityEventSerializer(data=payload)

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_order_requires_order_id(self):
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

        serializer = ActivityEventSerializer(data=payload)

        self.assertFalse(serializer.is_valid())
        self.assertIn("orderId", serializer.errors)

    def test_invalid_order_status_is_rejected(self):
        payload = {
            "eventType": "ORDER_STATUS_CHANGED",
            "entityType": "ORDER",
            "entityId": "5001",
            "restaurantId": 1,
            "orderId": "5001",
            "timestamp": "2026-03-14T21:10:00Z",
            "sourceService": "order-service",
            "payload": {
                "status": "PREPARING"
            },
        }

        serializer = ActivityEventSerializer(data=payload)

        self.assertFalse(serializer.is_valid())
        self.assertIn("payload", serializer.errors)