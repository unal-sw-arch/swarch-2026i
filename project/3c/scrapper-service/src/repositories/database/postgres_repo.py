import psycopg2
import logging
from config import Config

logger = logging.getLogger(__name__)

class PostgresRepo:
    def __init__(self):
        self.db_url = Config.DATABASE_URL
        self._init_db()

    def _get_connection(self):
        return psycopg2.connect(self.db_url)

    def _init_db(self):
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS notified_discounts (
                            id SERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            store VARCHAR(50) NOT NULL,
                            price_cents INTEGER NOT NULL,
                            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_notification 
                        ON notified_discounts(name, store, price_cents)
                    """)
                conn.commit()
        except Exception as e:
            logger.error(f"Error initializing Postgres database: {e}")

    def has_been_notified(self, name: str, store: str, price_cents: int) -> bool:
        """Check if a specific discount has already been notified. 
        Uses a 7-day cooldown unless the price drops by another 5% to ignore currency fluctuations."""
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT price_cents FROM notified_discounts 
                        WHERE name = %s AND store = %s AND timestamp >= NOW() - INTERVAL '7 days'
                        ORDER BY timestamp DESC
                        LIMIT 1
                    """, (name, store))
                    row = cursor.fetchone()
                    
                    if row:
                        last_price = row[0]
                        # If the current price is roughly the same or higher (ignoring <5% currency drift), suppress notification
                        if price_cents >= last_price * 0.95:
                            return True
                            
                    return False
        except Exception as e:
            logger.error(f"Error querying Postgres database: {e}")
            return False

    def save_notification(self, name: str, store: str, price_cents: int):
        """Save a notification record to prevent duplicate alerts."""
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO notified_discounts (name, store, price_cents)
                        VALUES (%s, %s, %s)
                    """, (name, store, price_cents))
                conn.commit()
        except Exception as e:
            logger.error(f"Error inserting into Postgres database: {e}")
