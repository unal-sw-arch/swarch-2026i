from .entities import ActivityEvent
from .enums import EntityType, EventType, OrderStatus


class DomainValidationError(Exception):
    pass


def validate_activity_event(event: ActivityEvent) -> None:
    if event.entity_type == EntityType.ORDER and not event.order_id:
        raise DomainValidationError(
            "order_id is required when entity_type is ORDER"
        )

    if (
        event.event_type == EventType.ORDER_STATUS_CHANGED
        or event.entity_type == EntityType.ORDER
    ):
        status_value = event.payload.get("status")

        if status_value is not None:
            allowed_statuses = {status.value for status in OrderStatus}
            if status_value not in allowed_statuses:
                raise DomainValidationError(
                    "payload.status must be one of: "
                    + ", ".join(allowed_statuses)
                )