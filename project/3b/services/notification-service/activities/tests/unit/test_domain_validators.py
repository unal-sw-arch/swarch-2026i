from datetime import datetime, timezone

from django.test import SimpleTestCase

from activities.domain.entities import ActivityEvent
from activities.domain.enums import EntityType, EventType
from activities.domain.validators import (
    DomainValidationError,
    validate_activity_event,
)


class ActivityEventDomainValidatorTests(SimpleTestCase):
    def test_order_status_changed_in_preparation_passes_domain_validation(self):
        event = ActivityEvent(
            event_type=EventType.ORDER_STATUS_CHANGED,
            entity_type=EntityType.ORDER,
            entity_id="5001",
            restaurant_id=1,
            order_id="5001",
            timestamp=datetime(2026, 3, 14, 21, 10, 0, tzinfo=timezone.utc),
            source_service="order-service",
            payload={"status": "IN_PREPARATION"},
        )

        validate_activity_event(event)

    def test_valid_order_event_passes_domain_validation(self):
        event = ActivityEvent(
            event_type=EventType.ORDER_CREATED,
            entity_type=EntityType.ORDER,
            entity_id="5001",
            restaurant_id=1,
            order_id="5001",
            timestamp=datetime(2026, 3, 14, 21, 10, 0, tzinfo=timezone.utc),
            source_service="order-service",
            payload={"status": "CREATED"},
        )

        validate_activity_event(event)

    def test_order_entity_requires_order_id(self):
        event = ActivityEvent(
            event_type=EventType.ORDER_CREATED,
            entity_type=EntityType.ORDER,
            entity_id="5001",
            restaurant_id=1,
            order_id=None,
            timestamp=datetime(2026, 3, 14, 21, 10, 0, tzinfo=timezone.utc),
            source_service="order-service",
            payload={"status": "CREATED"},
        )

        with self.assertRaises(DomainValidationError) as context:
            validate_activity_event(event)

        self.assertEqual(
            str(context.exception),
            "order_id is required when entity_type is ORDER",
        )

    def test_invalid_order_status_fails_domain_validation(self):
        event = ActivityEvent(
            event_type=EventType.ORDER_STATUS_CHANGED,
            entity_type=EntityType.ORDER,
            entity_id="5001",
            restaurant_id=1,
            order_id="5001",
            timestamp=datetime(2026, 3, 14, 21, 10, 0, tzinfo=timezone.utc),
            source_service="order-service",
            payload={"status": "PREPARING"},
        )

        with self.assertRaises(DomainValidationError) as context:
            validate_activity_event(event)

        self.assertIn(
            "payload.status must be one of:",
            str(context.exception),
        )