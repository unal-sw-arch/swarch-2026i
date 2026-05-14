from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, Optional

from .enums import EntityType, EventType


@dataclass(frozen=True)
class ActivityEvent:
    event_type: EventType
    entity_type: EntityType
    entity_id: str
    restaurant_id: int
    timestamp: datetime
    source_service: str
    payload: Dict[str, Any]
    order_id: Optional[str] = None