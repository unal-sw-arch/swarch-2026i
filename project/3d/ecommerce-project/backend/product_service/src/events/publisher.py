"""RabbitMQ publisher for product_service saga events."""

import json
import threading
import time

import pika

from product_service.src.core.config.settings import settings
from product_service.src.schemas.events import build_envelope


class SagaEventPublisher:

    def __init__(self):
        self._host = settings.rabbitmq_host
        self._exchange = settings.rabbitmq_saga_exchange
        self.connection = None
        self.channel = None
        self._lock = threading.Lock()

    def _ensure_channel(self) -> None:
        if self.channel is not None:
            return

        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=self._host,
                heartbeat=30,
                blocked_connection_timeout=10,
                connection_attempts=1,
                socket_timeout=5,
            )
        )
        self.channel = self.connection.channel()
        self.channel.exchange_declare(exchange=self._exchange, exchange_type="topic", durable=True)
        self.channel.exchange_declare(exchange="commerce.saga.dlx", exchange_type="topic", durable=True)

    def _publish(self, routing_key: str, envelope: dict) -> bool:
        max_attempts = 8
        base_delay = 0.5

        with self._lock:
            for attempt in range(1, max_attempts + 1):
                try:
                    self._ensure_channel()
                    if self.channel is None:
                        raise RuntimeError("channel not initialized")

                    self.channel.basic_publish(
                        exchange=self._exchange,
                        routing_key=routing_key,
                        body=json.dumps(envelope),
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

                    delay = min(base_delay * (2 ** (attempt - 1)), 5)
                    time.sleep(delay)

        return False

    def publish_stock_reserved(
        self,
        order_id: str,
        reservation_id: str,
        reservations: list[dict],
        expires_at: str,
        correlation_id: str,
    ) -> bool:
        data = {
            "order_id": order_id,
            "reservation_id": reservation_id,
            "reservations": reservations,
            "expires_at": expires_at,
        }
        envelope = build_envelope("STOCK_RESERVED", data, correlation_id)
        return self._publish("stock.reserved", envelope)

    def publish_stock_unavailable(
        self,
        order_id: str,
        unavailable_items: list[dict],
        correlation_id: str,
        reason: str = "insufficient_stock",
    ) -> bool:
        data = {
            "order_id": order_id,
            "unavailable_items": unavailable_items,
            "reason": reason,
        }
        envelope = build_envelope("STOCK_UNAVAILABLE", data, correlation_id)
        return self._publish("stock.unavailable", envelope)


