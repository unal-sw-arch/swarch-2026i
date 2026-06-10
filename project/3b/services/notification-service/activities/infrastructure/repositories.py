import logging
from typing import Any, Dict, List

from pymongo.errors import PyMongoError

from activities.application.ports import ActivityEventRepositoryPort
from activities.domain.entities import ActivityEvent

from .exceptions import InfrastructureError
from .mongo_client import MongoConnection


logger = logging.getLogger(__name__)


class MongoActivityEventRepository(ActivityEventRepositoryPort):
    def __init__(self):
        self.collection = MongoConnection.get_collection()

    def save(self, event: ActivityEvent) -> str:
        document = {
            "eventType": event.event_type.value,
            "entityType": event.entity_type.value,
            "entityId": event.entity_id,
            "restaurantId": event.restaurant_id,
            "orderId": event.order_id,
            "timestamp": event.timestamp,
            "sourceService": event.source_service,
            "payload": event.payload,
        }

        try:
            result = self.collection.insert_one(document)
            logger.info(
                "Activity event inserted in MongoDB",
                extra={
                    "eventId": str(result.inserted_id),
                    "eventType": document["eventType"],
                    "entityType": document["entityType"],
                    "entityId": document["entityId"],
                    "restaurantId": document["restaurantId"],
                    "orderId": document.get("orderId"),
                    "sourceService": document["sourceService"],
                },
            )
            return str(result.inserted_id)
        except PyMongoError as exc:
            logger.exception(
                "PyMongo failed while inserting activity event",
                extra={
                    "eventType": document["eventType"],
                    "entityType": document["entityType"],
                    "entityId": document["entityId"],
                    "restaurantId": document["restaurantId"],
                    "orderId": document.get("orderId"),
                    "sourceService": document["sourceService"],
                },
            )
            raise InfrastructureError(
                "Failed to persist activity event"
            ) from exc

    def find_by_order_id(self, order_id: str) -> List[Dict[str, Any]]:
        try:
            documents = self.collection.find(
                {"orderId": order_id}
            ).sort("timestamp", -1)

            return [self._to_response_document(doc) for doc in documents]
        except PyMongoError as exc:
            logger.exception(
                "PyMongo failed while retrieving activity events",
                extra={"orderId": order_id},
            )
            raise InfrastructureError(
                "Failed to retrieve activity events"
            ) from exc

    def _to_response_document(self, doc: Dict[str, Any]) -> Dict[str, Any]:
        timestamp = doc.get("timestamp")

        if hasattr(timestamp, "isoformat"):
            timestamp = timestamp.isoformat().replace("+00:00", "Z")

        return {
            "id": str(doc["_id"]),
            "eventType": doc["eventType"],
            "entityType": doc["entityType"],
            "entityId": doc["entityId"],
            "restaurantId": doc["restaurantId"],
            "orderId": doc.get("orderId"),
            "timestamp": timestamp,
            "sourceService": doc["sourceService"],
            "payload": doc["payload"],
        }