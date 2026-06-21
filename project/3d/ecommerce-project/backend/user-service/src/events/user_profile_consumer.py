"""RabbitMQ consumer that creates user profiles from auth registration events."""

import json
import os
import threading
import time

import pika
from fastapi import HTTPException

from ..core.db import SessionLocal
from ..schemas.schemas import ProfileCreate
from ..services.services import UserService


class UserProfileEventConsumer:
    """Consume AUTH_USER_REGISTERED events and create profiles in user-service."""

    def __init__(self):
        self.host = os.getenv("RABBITMQ_HOST", "rabbitmq")
        self.queue_name = os.getenv("USER_PROFILE_QUEUE_NAME", "user_profile_create_queue")
        self._stop_event = threading.Event()
        self._thread = None
        self._connection = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return

        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop_event.set()
        try:
            if self._connection and self._connection.is_open:
                self._connection.close()
        except Exception:
            pass

        if self._thread:
            self._thread.join(timeout=2)

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                self._connection = pika.BlockingConnection(
                    pika.ConnectionParameters(host=self.host)
                )
                channel = self._connection.channel()
                channel.queue_declare(queue=self.queue_name, durable=True)
                channel.basic_qos(prefetch_count=10)
                channel.basic_consume(
                    queue=self.queue_name,
                    on_message_callback=self._on_message,
                    auto_ack=False,
                )

                while not self._stop_event.is_set():
                    self._connection.process_data_events(time_limit=1)

                channel.close()
            except Exception:
                time.sleep(2)
            finally:
                try:
                    if self._connection and self._connection.is_open:
                        self._connection.close()
                except Exception:
                    pass

    def _on_message(self, channel, method, _properties, body) -> None:
        try:
            payload = json.loads(body.decode("utf-8"))
            if payload.get("event") != "AUTH_USER_REGISTERED":
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            data = payload.get("data")
            if not isinstance(data, dict):
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            email = data.get("email")
            full_name = data.get("full_name")
            if not isinstance(email, str) or not isinstance(full_name, str):
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            profile = ProfileCreate(
                name=full_name.strip(),
                email=email.strip().lower(),
                phone=data.get("phone"),
                role=data.get("role", "customer"),
            )

            db = SessionLocal()
            try:
                service = UserService(db)
                try:
                    service.create_profile(profile)
                except HTTPException as exc:
                    if exc.status_code != 409:
                        raise
            finally:
                db.close()

            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
