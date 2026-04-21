from abc import ABC, abstractmethod
from typing import Any, Dict, List

from activities.domain.entities import ActivityEvent


class ActivityEventRepositoryPort(ABC):
    @abstractmethod
    def save(self, event: ActivityEvent) -> str:
        pass

    @abstractmethod
    def find_by_order_id(self, order_id: str) -> List[Dict[str, Any]]:
        pass