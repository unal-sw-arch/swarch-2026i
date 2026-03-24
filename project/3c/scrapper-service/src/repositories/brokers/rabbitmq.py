import pika
import json
import logging
from typing import List, Dict, Any
from .base import BaseProducer
from config import Config

logger = logging.getLogger(__name__)

class RabbitMQProducer(BaseProducer):
    def __init__(self):
        self.host = Config.RABBITMQ_HOST
        self.port = Config.RABBITMQ_PORT
        self.user = Config.RABBITMQ_USER
        self.password = Config.RABBITMQ_PASSWORD
        self.queue_name = Config.QUEUE_NAME
        self.connection = None
        self.channel = None

    def connect(self):
        try:
            credentials = pika.PlainCredentials(self.user, self.password)
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials
            )
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=self.queue_name, durable=True)
            logger.info(f"Connected to RabbitMQ at {self.host}:{self.port}")
        except Exception as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}")
            raise

    def publish(self, games: List[Dict[str, Any]]):
        if not self.channel:
            logger.error("Cannot publish. Not connected to RabbitMQ.")
            return

        for game in games:
            try:
                message = json.dumps(game)
                self.channel.basic_publish(
                    exchange='',
                    routing_key=self.queue_name,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,
                    )
                )
                logger.debug(f"Published game: {game.get('name')}")
            except Exception as e:
                logger.error(f"Failed to publish message: {e}")

    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            logger.info("Closed RabbitMQ connection.")
