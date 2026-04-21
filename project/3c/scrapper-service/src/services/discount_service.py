import logging
from typing import List, Dict, Any
from repositories.database.postgres_repo import PostgresRepo

logger = logging.getLogger(__name__)

class DiscountService:
    def __init__(self):
        self.db_repo = PostgresRepo()

    def process_discounts(self, games: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Evaluate games for >=10% discounts. 
        If a new discount is found and hasn't been notified yet, 
        add it to the list and save it to the DB to prevent duplicate alerts.
        """
        notifiable_discounts = []

        for game in games:
            name = game.get("name")
            store = game.get("store")
            current_price = game.get("price_cents", 0)
            original_price = game.get("original_price_cents", 0)

            if not name or not store or not original_price:
                continue

            # Calculate if discount is >= 10%
            target_discount_price = original_price * 0.90

            if current_price <= target_discount_price:
                if not self.db_repo.has_been_notified(name, store, current_price):
                    notifiable_discounts.append(game)
                    self.db_repo.save_notification(name, store, current_price)
                    logger.info(f"New discount detected for {name} on {store}: {current_price} cents (Original: {original_price} cents)")
                else:
                    logger.debug(f"Discount for {name} on {store} at {current_price} cents already notified.")
                    
        return notifiable_discounts
