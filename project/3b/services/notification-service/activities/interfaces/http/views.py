import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from activities.domain.entities import ActivityEvent
from activities.domain.enums import EntityType, EventType
from activities.domain.validators import DomainValidationError
from activities.infrastructure.container import (
    build_get_order_activity_history_use_case,
    build_record_activity_event_use_case,
)
from activities.infrastructure.exceptions import InfrastructureError

from .errors import error_response
from .serializers import ActivityEventSerializer


logger = logging.getLogger(__name__)


class CreateActivityView(APIView):
    def post(self, request):
        serializer = ActivityEventSerializer(data=request.data)

        if not serializer.is_valid():
            logger.warning(
                "Activity event validation failed",
                extra={
                    "eventType": request.data.get("eventType"),
                    "entityType": request.data.get("entityType"),
                    "entityId": request.data.get("entityId"),
                    "restaurantId": request.data.get("restaurantId"),
                    "orderId": request.data.get("orderId"),
                    "sourceService": request.data.get("sourceService"),
                    "errorFields": list(serializer.errors.keys()),
                },
            )
            return error_response(
                code="INVALID_EVENT",
                message="Invalid activity event payload",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        event = ActivityEvent(
            event_type=EventType(data["eventType"]),
            entity_type=EntityType(data["entityType"]),
            entity_id=data["entityId"],
            restaurant_id=data["restaurantId"],
            order_id=data.get("orderId"),
            timestamp=data["timestamp"],
            source_service=data["sourceService"],
            payload=data["payload"],
        )

        logger.info(
            "Received activity event for processing",
            extra={
                "eventType": event.event_type.value,
                "entityType": event.entity_type.value,
                "entityId": event.entity_id,
                "restaurantId": event.restaurant_id,
                "orderId": event.order_id,
                "sourceService": event.source_service,
            },
        )

        use_case = build_record_activity_event_use_case()

        try:
            result = use_case.execute(event)
        except DomainValidationError as exc:
            logger.warning(
                "Activity event domain validation failed",
                extra={
                    "eventType": event.event_type.value,
                    "entityType": event.entity_type.value,
                    "entityId": event.entity_id,
                    "restaurantId": event.restaurant_id,
                    "orderId": event.order_id,
                    "sourceService": event.source_service,
                    "error": str(exc),
                },
            )
            return error_response(
                code="INVALID_EVENT",
                message=str(exc),
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        except InfrastructureError:
            logger.exception(
                "Activity event persistence failed",
                extra={
                    "eventType": event.event_type.value,
                    "entityType": event.entity_type.value,
                    "entityId": event.entity_id,
                    "restaurantId": event.restaurant_id,
                    "orderId": event.order_id,
                    "sourceService": event.source_service,
                },
            )
            return error_response(
                code="INTERNAL_ERROR",
                message="A persistence error occurred",
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        logger.info(
            "Activity event persisted successfully",
            extra={
                "eventId": result.get("id"),
                "eventType": event.event_type.value,
                "entityType": event.entity_type.value,
                "entityId": event.entity_id,
                "restaurantId": event.restaurant_id,
                "orderId": event.order_id,
                "sourceService": event.source_service,
            },
        )

        return Response(result, status=status.HTTP_201_CREATED)


class OrderActivityHistoryView(APIView):
    def get(self, request, order_id):
        logger.info(
            "Fetching order activity history",
            extra={"orderId": order_id},
        )

        use_case = build_get_order_activity_history_use_case()

        try:
            result = use_case.execute(order_id)
        except InfrastructureError:
            logger.exception(
                "Order activity history persistence failure",
                extra={"orderId": order_id},
            )
            return error_response(
                code="INTERNAL_ERROR",
                message="A persistence error occurred",
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(result, status=status.HTTP_200_OK)