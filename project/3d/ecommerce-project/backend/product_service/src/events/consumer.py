"""RabbitMQ consumer for product_service saga events (ORDER_CREATED, ORDER_CANCELLED)."""

import json
import logging
import threading
import time
import uuid
from datetime import datetime, timedelta

import pika
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, Session

from product_service.src.core.config.settings import settings
from product_service.src.models.product import Product
from product_service.src.models.reservation import StockReservation
from product_service.src.models.processed_event import ProcessedEvent
from product_service.src.events.publisher import SagaEventPublisher

logger = logging.getLogger(__name__)

_QUEUE = "product.saga.order_events"
_BINDING_KEYS = ["order.created", "order.cancelled"]
_DLQ = "product.saga.order_events.dlq"


class ProductSagaConsumer:
    """Consume saga events from order_service and manage stock accordingly."""

    def __init__(self):
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._connection: pika.BlockingConnection | None = None

        sync_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        self._engine = create_engine(sync_url, pool_size=3, max_overflow=0, pool_pre_ping=True)
        self._Session = sessionmaker(bind=self._engine)
        self._publisher = SagaEventPublisher()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, daemon=True, name="ProductSagaConsumer")
        self._thread.start()
        logger.info("ProductSagaConsumer started")

    def stop(self) -> None:
        self._stop_event.set()
        try:
            if self._connection and self._connection.is_open:
                self._connection.close()
        except Exception:
            pass
        if self._thread:
            self._thread.join(timeout=5)
        logger.info("ProductSagaConsumer stopped")

    def _run(self) -> None:
        while not self._stop_event.is_set():
            try:
                self._connection = pika.BlockingConnection(
                    pika.ConnectionParameters(
                        host=settings.rabbitmq_host,
                        port=settings.rabbitmq_port,
                        heartbeat=30,
                        blocked_connection_timeout=10,
                    )
                )
                channel = self._connection.channel()

                channel.exchange_declare(exchange=settings.rabbitmq_saga_exchange, exchange_type="topic", durable=True)
                channel.exchange_declare(exchange="commerce.saga.dlx", exchange_type="topic", durable=True)

                channel.queue_declare(
                    queue=_QUEUE,
                    durable=True,
                    arguments={"x-dead-letter-exchange": "commerce.saga.dlx"},
                )
                channel.queue_declare(queue=_DLQ, durable=True)
                channel.queue_bind(exchange="commerce.saga.dlx", queue=_DLQ, routing_key="#")

                for key in _BINDING_KEYS:
                    channel.queue_bind(exchange=settings.rabbitmq_saga_exchange, queue=_QUEUE, routing_key=key)

                channel.basic_qos(prefetch_count=5)
                channel.basic_consume(queue=_QUEUE, on_message_callback=self._on_message, auto_ack=False)

                logger.info("ProductSagaConsumer listening on queue %s", _QUEUE)

                while not self._stop_event.is_set():
                    self._connection.process_data_events(time_limit=1)

                channel.close()

            except Exception as exc:
                logger.warning("ProductSagaConsumer connection error: %r — retrying in 2s", exc)
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

            if event_type == "ORDER_CREATED":
                self._handle_order_created(envelope, event_id, correlation_id)
            elif event_type == "ORDER_CANCELLED":
                self._handle_order_cancelled(envelope, event_id, correlation_id)
            else:
                logger.debug("ProductSagaConsumer: ignoring unknown event_type=%s", event_type)

            channel.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as exc:
            logger.error("ProductSagaConsumer: error processing message: %s", exc, exc_info=True)
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    def _handle_order_created(self, envelope: dict, event_id: str, correlation_id: str) -> None:
        data = envelope.get("data", {})
        order_id_str = data.get("order_id", "")
        items = data.get("items", [])

        log_prefix = f"[{correlation_id}] [product] [ORDER_CREATED] order={order_id_str}"

        try:
            order_uuid = uuid.UUID(order_id_str)
        except (ValueError, AttributeError):
            logger.error("%s invalid order_id", log_prefix)
            return

        with self._Session() as session:
            if self._is_processed(session, event_id):
                logger.info("%s skipped (already processed)", log_prefix)
                return

            # Check stock availability with pessimistic lock
            unavailable = []
            for item in items:
                product_id_str = item.get("product_id")
                qty = int(item.get("quantity", 0))
                try:
                    product_uuid = uuid.UUID(str(product_id_str))
                except (ValueError, AttributeError):
                    unavailable.append({"product_id": product_id_str, "requested": qty, "available": 0})
                    continue

                product = session.execute(
                    select(Product).where(Product.id == product_uuid).with_for_update()
                ).scalar_one_or_none()

                if product is None:
                    unavailable.append({"product_id": product_id_str, "requested": qty, "available": 0})
                    continue

                if not product.is_active or product.stock < qty:
                    unavailable.append({
                        "product_id": product_id_str,
                        "requested": qty,
                        "available": product.stock,
                    })

            if unavailable:
                session.add(ProcessedEvent(event_id=event_id, event_type="ORDER_CREATED"))
                session.commit()

                logger.warning("%s stock unavailable: %s", log_prefix, unavailable)
                published = self._publisher.publish_stock_unavailable(
                    order_id=order_id_str,
                    unavailable_items=unavailable,
                    correlation_id=correlation_id,
                )
                if not published:
                    logger.error("%s failed to publish STOCK_UNAVAILABLE", log_prefix)
                return

            # Reserve stock atomically
            reservation_id = uuid.uuid4()
            reservation_id_str = str(reservation_id)
            expires_at = (datetime.utcnow() + timedelta(minutes=15)).isoformat() + "Z"
            reservations = []

            for item in items:
                product_id_str = item.get("product_id")
                qty = int(item.get("quantity", 0))
                product_uuid = uuid.UUID(str(product_id_str))

                product = session.execute(
                    select(Product).where(Product.id == product_uuid).with_for_update()
                ).scalar_one_or_none()

                product.stock -= qty
                session.add(StockReservation(
                    reservation_id=reservation_id,
                    order_id=order_uuid,
                    product_id=product_uuid,
                    quantity_reserved=qty,
                    expires_at=datetime.utcnow() + timedelta(minutes=15),
                    status="ACTIVE",
                ))
                reservations.append({"product_id": product_id_str, "reserved_qty": qty})

            session.add(ProcessedEvent(event_id=event_id, event_type="ORDER_CREATED"))
            session.commit()

        logger.info("%s reserved reservation_id=%s", log_prefix, reservation_id_str)
        published = self._publisher.publish_stock_reserved(
            order_id=order_id_str,
            reservation_id=reservation_id_str,
            reservations=reservations,
            expires_at=expires_at,
            correlation_id=correlation_id,
        )
        if not published:
            logger.error("%s failed to publish STOCK_RESERVED", log_prefix)

    def _handle_order_cancelled(self, envelope: dict, event_id: str, correlation_id: str) -> None:
        data = envelope.get("data", {})
        order_id_str = data.get("order_id", "")

        log_prefix = f"[{correlation_id}] [product] [ORDER_CANCELLED] order={order_id_str}"

        try:
            order_uuid = uuid.UUID(order_id_str)
        except (ValueError, AttributeError):
            logger.error("%s invalid order_id", log_prefix)
            return

        with self._Session() as session:
            if self._is_processed(session, event_id):
                logger.info("%s skipped (already processed)", log_prefix)
                return

            released = False
            reservations = session.execute(
                select(StockReservation).where(
                    StockReservation.order_id == order_uuid,
                    StockReservation.status == "ACTIVE",
                ).with_for_update()
            ).scalars().all()

            if reservations:
                product_ids = [r.product_id for r in reservations]
                products_by_id = {
                    p.id: p for p in session.execute(
                        select(Product).where(Product.id.in_(product_ids)).with_for_update()
                    ).scalars().all()
                }

                for reservation in reservations:
                    product = products_by_id.get(reservation.product_id)
                    if product:
                        product.stock += reservation.quantity_reserved
                    reservation.status = "RELEASED"

                released = True
                logger.info("%s released %d reservation(s)", log_prefix, len(reservations))

            session.add(ProcessedEvent(event_id=event_id, event_type="ORDER_CANCELLED"))
            session.commit()

        if not released:
            logger.info("%s no active reservations to release", log_prefix)

    @staticmethod
    def _is_processed(session: Session, event_id: str) -> bool:
        return session.get(ProcessedEvent, event_id) is not None
