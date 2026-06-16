"""RabbitMQ publisher for auth_service domain events."""

import json
import time

import pika


class EventPublisher:
    """Publish auth events to a durable queue consumed by user-service."""

    def __init__(self, host: str, queue_name: str):
        self.host = host
        self.queue_name = queue_name
        self.connection = None
        self.channel = None

    def _ensure_channel(self) -> None:
        if self.channel is not None:
            return

        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=self.host,
                heartbeat=30,
                blocked_connection_timeout=10,
                connection_attempts=1,
                socket_timeout=5,
            )
        )
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue=self.queue_name, durable=True)

    def publish(self, event_type: str, data: dict) -> bool:
        max_attempts = 8
        base_delay_seconds = 0.5

        for attempt in range(1, max_attempts + 1):
            try:
                self._ensure_channel()
                if self.channel is None:
                    raise RuntimeError("RabbitMQ channel was not initialized")

                message = json.dumps({"event": event_type, "data": data})
                self.channel.basic_publish(
                    exchange="",
                    routing_key=self.queue_name,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,
                        content_type="application/json",
                    ),
                )
                return True
            except Exception:
                self.connection = None
                self.channel = None

                if attempt == max_attempts:
                    return False

                delay = min(base_delay_seconds * (2 ** (attempt - 1)), 5)
                time.sleep(delay)

        return False
