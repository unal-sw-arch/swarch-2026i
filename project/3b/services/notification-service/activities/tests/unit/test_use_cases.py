from datetime import datetime, timezone
from unittest.mock import Mock

from django.test import SimpleTestCase

from activities.application.use_cases import (
    GetOrderActivityHistoryUseCase,
    RecordActivityEventUseCase,
)
from activities.domain.entities import ActivityEvent
from activities.domain.enums import EntityType, EventType
from activities.domain.validators import DomainValidationError


class RecordActivityEventUseCaseTests(SimpleTestCase):
    def test_execute_persists_valid_event_and_returns_recorded_status(self):
        mock_repository = Mock()
        mock_repository.save.return_value = "mocked-event-id"

        use_case = RecordActivityEventUseCase(repository=mock_repository)

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

        result = use_case.execute(event)

        mock_repository.save.assert_called_once_with(event)
        self.assertEqual(
            result,
            {
                "id": "mocked-event-id",
                "status": "RECORDED",
            },
        )

    def test_execute_raises_domain_error_before_persisting_invalid_event(self):
        mock_repository = Mock()
        use_case = RecordActivityEventUseCase(repository=mock_repository)

        invalid_event = ActivityEvent(
            event_type=EventType.ORDER_STATUS_CHANGED,
            entity_type=EntityType.ORDER,
            entity_id="5001",
            restaurant_id=1,
            order_id="5001",
            timestamp=datetime(2026, 3, 14, 21, 10, 0, tzinfo=timezone.utc),
            source_service="order-service",
            payload={"status": "PREPARING"},
        )

        with self.assertRaises(DomainValidationError):
            use_case.execute(invalid_event)

        mock_repository.save.assert_not_called()


class GetOrderActivityHistoryUseCaseTests(SimpleTestCase):
    def test_execute_returns_history_for_order_id(self):
        mock_repository = Mock()
        mock_repository.find_by_order_id.return_value = [
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
            },
            {
                "id": "evt-2",
                "eventType": "ORDER_STATUS_CHANGED",
                "entityType": "ORDER",
                "entityId": "5001",
                "restaurantId": 1,
                "orderId": "5001",
                "timestamp": "2026-03-14T21:20:00Z",
                "sourceService": "order-service",
                "payload": {"status": "IN_PREPARATION"},
            },
        ]

        use_case = GetOrderActivityHistoryUseCase(repository=mock_repository)

        result = use_case.execute("5001")

        mock_repository.find_by_order_id.assert_called_once_with("5001")
        self.assertEqual(
            result,
            {
                "orderId": "5001",
                "events": mock_repository.find_by_order_id.return_value,
            },
        )