from activities.application.ports import ActivityEventRepositoryPort
from activities.domain.entities import ActivityEvent
from activities.domain.validators import validate_activity_event


class RecordActivityEventUseCase:
    def __init__(self, repository: ActivityEventRepositoryPort):
        self.repository = repository

    def execute(self, event: ActivityEvent) -> dict:
        validate_activity_event(event)

        inserted_id = self.repository.save(event)

        return {
            "id": inserted_id,
            "status": "RECORDED",
        }


class GetOrderActivityHistoryUseCase:
    def __init__(self, repository: ActivityEventRepositoryPort):
        self.repository = repository

    def execute(self, order_id: str) -> dict:
        events = self.repository.find_by_order_id(order_id)

        return {
            "orderId": order_id,
            "events": events,
        }