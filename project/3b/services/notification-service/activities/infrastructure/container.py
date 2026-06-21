from activities.application.use_cases import (
    GetOrderActivityHistoryUseCase,
    RecordActivityEventUseCase,
)
from activities.infrastructure.repositories import MongoActivityEventRepository


def build_record_activity_event_use_case() -> RecordActivityEventUseCase:
    repository = MongoActivityEventRepository()
    return RecordActivityEventUseCase(repository=repository)


def build_get_order_activity_history_use_case() -> GetOrderActivityHistoryUseCase:
    repository = MongoActivityEventRepository()
    return GetOrderActivityHistoryUseCase(repository=repository)