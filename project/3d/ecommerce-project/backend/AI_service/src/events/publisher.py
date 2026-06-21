import json
import pika
import os


class EventPublisher:

    def __init__(self, host: str | None = None, exchange: str | None = None):
        self.host = host or os.getenv("RABBITMQ_HOST", "localhost")
        self.exchange = exchange or os.getenv("RABBITMQ_EXCHANGE", "events")
        self.connection = None
        self.channel = None

    def _ensure_channel(self):
        if self.channel is not None:
            return

        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=self.host)
            )
            self.channel = self.connection.channel()
            self.channel.exchange_declare(exchange=self.exchange, exchange_type='fanout', durable=True)
        except Exception:
            self.connection = None
            self.channel = None

    def publish(self, event_type: str, data: dict):
        self._ensure_channel()
        if self.channel is None:
            return False

        message = {
            "event": event_type,
            "data": data
        }

        try:
            self.channel.basic_publish(
                exchange=self.exchange,
                routing_key='',
                body=json.dumps(message)
            )
            return True
        except Exception:
            self.connection = None
            self.channel = None
            return False

    def publish_order_created(self, order: dict):
        return self.publish("order.created", order)

    def publish_order_updated(self, order: dict):
        return self.publish("order.updated", order)

    def publish_order_cancelled(self, order: dict):
        return self.publish("order.cancelled", order)


event_publisher = EventPublisher()