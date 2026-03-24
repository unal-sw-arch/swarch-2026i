from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseProducer(ABC):
    @abstractmethod
    def connect(self):
        pass
        
    @abstractmethod
    def publish(self, games: List[Dict[str, Any]]):
        pass
        
    @abstractmethod
    def close(self):
        pass
