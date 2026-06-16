"""RabbitMQ publisher for order_service: fanout broadcast + saga topic exchange."""

import json
import os
import threading
import time

import pika


class EventPublisher:

    def __init__(self, host: str | None = None, exchange: str | None = None):
        self.host = host or os.getenv("RABBITMQ_HOST", "localhost")
        self.exchange = exchange or os.getenv("RABBITMQ_EXCHANGE", "events")
        self._saga_exchange = os.getenv("RABBITMQ_SAGA_EXCHANGE", "commerce.saga")
        self.connection = None
        self.channel = None
        self._lock = threading.Lock()

    def _ensure_channel(self) -> None:
        if self.channel is not None:
            return

        try:
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
            self.channel.exchange_declare(exchange=self.exchange, exchange_type="fanout")
            self.channel.exchange_declare(exchange=self._saga_exchange, exchange_type="topic", durable=True)

            # DLX declarado pero sin lógica de inspección
            self.channel.exchange_declare(exchange="commerce.saga.dlx", exchange_type="topic", durable=True)
        except Exception:
            self.connection = None
            self.channel = None

    def _publish_with_retry(self, exchange: str, routing_key: str, body: str) -> bool:
        max_attempts = 8
        base_delay = 0.5

        with self._lock:
            for attempt in range(1, max_attempts + 1):
                try:
                    self._ensure_channel()
                    if self.channel is None:
                        raise RuntimeError("channel not initialized")

                    self.channel.basic_publish(
                        exchange=exchange,
                        routing_key=routing_key,
                        body=body,
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

    def publish(self, event_type: str, data: dict) -> bool:
        """Publish to fanout `events` exchange (broadcast)."""
        body = json.dumps({"event": event_type, "data": data})
        return self._publish_with_retry(self.exchange, "", body)

    def publish_saga(self, routing_key: str, envelope: dict) -> bool:
        """Publish to topic `commerce.saga` exchange with given routing key."""
        body = json.dumps(envelope)
        return self._publish_with_retry(self._saga_exchange, routing_key, body)

    def publish_order_created(self, order: dict) -> bool:
        return self.publish("ORDER_CREATED", order)

    def publish_order_updated(self, order: dict) -> bool:
        return self.publish("ORDER_UPDATED", order)

    def publish_order_cancelled(self, order: dict) -> bool:
        return self.publish("ORDER_CANCELLED", order)


event_publisher = EventPublisher()
