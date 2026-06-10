import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")
    QUEUE_NAME = os.getenv("QUEUE_NAME", "game_prices_queue")
    NOTIFICATION_QUEUE_NAME = os.getenv("NOTIFICATION_QUEUE_NAME", "notification_queue")
    LOOP_INTERVAL_MINUTES = max(1, int(os.getenv("SCRAPPER_LOOP_INTERVAL_MINUTES", "2")))
    USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:4000")
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
