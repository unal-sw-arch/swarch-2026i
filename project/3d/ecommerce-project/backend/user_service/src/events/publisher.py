import json
import pika


class EventPublisher:

    def __init__(self):
        import os

        self.host = os.getenv("RABBITMQ_HOST", "localhost")
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
            self.channel.exchange_declare(exchange='events', exchange_type='fanout')
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
                exchange='events',
                routing_key='',
                body=json.dumps(message)
            )
            return True
        except Exception:
            self.connection = None
            self.channel = None
            return False
