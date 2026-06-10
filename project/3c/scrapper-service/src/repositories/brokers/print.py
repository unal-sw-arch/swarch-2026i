import logging
from typing import List, Dict, Any
from .base import BaseProducer

logger = logging.getLogger(__name__)

class PrintBroker(BaseProducer):
    def connect(self):
        logger.info("PrintBroker connected (Dummy Broker).")

    def publish(self, games: List[Dict[str, Any]]):
        logger.info(f"Publishing {len(games)} games to console:")
        for game in games:
            print(game)

    def close(self):
        logger.info("PrintBroker connection closed.")
