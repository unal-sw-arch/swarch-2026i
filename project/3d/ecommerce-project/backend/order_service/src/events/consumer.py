"""RabbitMQ consumer for order_service saga events (STOCK_RESERVED, STOCK_UNAVAILABLE)."""

import json
import logging
import threading
import time
import uuid

import pika
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session

from order_service.src.core.config.settings import settings
from order_service.src.models.order import Order, OrderStatus
from order_service.src.models.processed_event import ProcessedEvent
from order_service.src.schemas.events import build_envelope

logger = logging.getLogger(__name__)

_QUEUE = "order.saga.stock_events"
_BINDING_KEYS = ["stock.reserved", "stock.unavailable"]
_DLQ = "order.saga.stock_events.dlq"


class OrderSagaConsumer:
    """Consume STOCK_RESERVED and STOCK_UNAVAILABLE and update order state."""

    def __init__(self):
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._connection: pika.BlockingConnection | None = None

        sync_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        self._engine = create_engine(sync_url, pool_size=3, max_overflow=0, pool_pre_ping=True)
        self._Session = sessionmaker(bind=self._engine)

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, daemon=True, name="OrderSagaConsumer")
        self._thread.start()
        logger.info("OrderSagaConsumer started")

    def stop(self) -> None:
        self._stop_event.set()
        try:
            if self._connection and self._connection.is_open:
                self._connection.close()
        except Exception:
            pass
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("OrderSagaConsumer stopped")

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                self._connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=settings.RABBITMQ_HOST,
                        port=settings.RABBITMQ_PORT,
                        heartbeat=30,
                        blocked_connection_timeout=10,
                    )
                )
                channel = self._connection.channel()

                channel.exchange_declare(
                    exchange=settings.RABBITMQ_SAGA_EXCHANGE, exchange_type="topic", durable=True
                )
                channel.exchange_declare(exchange="commerce.saga.dlx", exchange_type="topic", durable=True)

                channel.queue_declare(
                    queue=_QUEUE,
                    durable=True,
                    arguments={"x-dead-letter-exchange": "commerce.saga.dlx"},
                )
                channel.queue_declare(queue=_DLQ, durable=True)
                channel.queue_bind(exchange="commerce.saga.dlx", queue=_DLQ, routing_key="#")

                for key in _BINDING_KEYS:
                    channel.queue_bind(
                        exchange=settings.RABBITMQ_SAGA_EXCHANGE, queue=_QUEUE, routing_key=key
                    )

                channel.basic_qos(prefetch_count=10)
                channel.basic_consume(queue=_QUEUE, on_message_callback=self._on_message, auto_ack=False)

                logger.info("OrderSagaConsumer listening on queue %s", _QUEUE)

                while not self._stop_event.is_set():
                    self._connection.process_data_events(time_limit=1)

                channel.close()

            except Exception as exc:
                logger.warning("OrderSagaConsumer connection error: %r — retrying in 2s", exc)
                time.sleep(2)
            finally:
                try:
                    if self._connection and self._connection.is_open:
                        self._connection.close()
                except Exception:
                    pass

    def _on_message(self, channel, method, _properties, body: bytes) -> None:
        try:
            envelope = json.loads(body.decode("utf-8"))
            event_type = envelope.get("event_type", "")
            event_id = envelope.get("event_id", "")
            correlation_id = envelope.get("correlation_id", str(uuid.uuid4()))

            if event_type == "STOCK_RESERVED":
                self._handle_stock_reserved(envelope, event_id, correlation_id)
            elif event_type == "STOCK_UNAVAILABLE":
                self._handle_stock_unavailable(envelope, event_id, correlation_id)
            else:
                logger.debug("OrderSagaConsumer: ignoring unknown event_type=%s", event_type)

            channel.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as exc:
            logger.error("OrderSagaConsumer: error processing message: %s", exc, exc_info=True)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    def _handle_stock_reserved(self, envelope: dict, event_id: str, correlation_id: str) -> None:
        data = envelope.get("data", {})
        order_id_str = data.get("order_id", "")
        reservation_id_str = data.get("reservation_id", "")

        log_prefix = f"[{correlation_id}] [order] [STOCK_RESERVED] order={order_id_str}"

        try:
            import uuid as _uuid
            order_uuid = _uuid.UUID(order_id_str)
            reservation_uuid = _uuid.UUID(reservation_id_str)
        except (ValueError, AttributeError):
            logger.error("%s invalid order_id or reservation_id", log_prefix)
            return

        with self._Session() as session:
            if self._is_processed(session, event_id):
                logger.info("%s skipped (already processed)", log_prefix)
                return

            order = session.execute(select(Order).where(Order.id == order_uuid)).scalar_one_or_none()
            if order is None:
                logger.error("%s order not found", log_prefix)
                session.add(ProcessedEvent(event_id=event_id, event_type="STOCK_RESERVED"))
                session.commit()
                return

            if order.status == OrderStatus.cancelled:
                # Order was cancelled (timeout or user) before stock confirmation arrived.
                # Record idempotency and trigger cleanup so product_service releases the reservation.
                order.reservation_id = reservation_uuid
                session.add(ProcessedEvent(event_id=event_id, event_type="STOCK_RESERVED"))
                session.commit()
                logger.warning(
                    "%s order already cancelled — will publish ORDER_CANCELLED to release reservation_id=%s",
                    log_prefix, reservation_id_str,
                )
                from order_service.src.events.publisher import event_publisher
                from order_service.src.schemas.events import build_envelope
                cleanup_envelope = build_envelope(
                    "ORDER_CANCELLED",
                    {"order_id": order_id_str, "reason": "already_cancelled", "reservation_id": reservation_id_str},
                    correlation_id,
                )
                published = event_publisher.publish_saga("order.cancelled", cleanup_envelope)
                if not published:
                    logger.error("%s failed to publish cleanup ORDER_CANCELLED", log_prefix)
                return

            order.status = OrderStatus.confirmed
            order.reservation_id = reservation_uuid
            session.add(ProcessedEvent(event_id=event_id, event_type="STOCK_RESERVED"))
            session.commit()

        logger.info("%s confirmed with reservation_id=%s", log_prefix, reservation_id_str)

    def _handle_stock_unavailable(self, envelope: dict, event_id: str, correlation_id: str) -> None:
        data = envelope.get("data", {})
        order_id_str = data.get("order_id", "")

        log_prefix = f"[{correlation_id}] [order] [STOCK_UNAVAILABLE] order={order_id_str}"

        try:
            import uuid as _uuid
            order_uuid = _uuid.UUID(order_id_str)
        except (ValueError, AttributeError):
            logger.error("%s invalid order_id", log_prefix)
            return

        with self._Session() as session:
            if self._is_processed(session, event_id):
                logger.info("%s skipped (already processed)", log_prefix)
                return

            order = session.execute(select(Order).where(Order.id == order_uuid)).scalar_one_or_none()
            if order is None:
                logger.error("%s order not found", log_prefix)
                session.add(ProcessedEvent(event_id=event_id, event_type="STOCK_UNAVAILABLE"))
                session.commit()
                return

            order.status = OrderStatus.cancelled
            session.add(ProcessedEvent(event_id=event_id, event_type="STOCK_UNAVAILABLE"))
            session.commit()

        logger.warning("%s cancelled due to stock unavailability", log_prefix)

        # Publish compensating ORDER_CANCELLED (no reservation_id — stock was never reserved)
        from order_service.src.events.publisher import event_publisher
        cancelled_envelope = build_envelope(
            "ORDER_CANCELLED",
            {"order_id": order_id_str, "reason": "stock_unavailable", "reservation_id": None},
            correlation_id,
        )
        published = event_publisher.publish_saga("order.cancelled", cancelled_envelope)
        if not published:
            logger.error("%s failed to publish ORDER_CANCELLED", log_prefix)

    @staticmethod
    def _is_processed(session: Session, event_id: str) -> bool:
        return session.get(ProcessedEvent, event_id) is not None
