package com.clickmunch.NotificationService.event;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.clickmunch.NotificationService.config.RabbitMQConfig;
import com.clickmunch.NotificationService.dto.CreateNotificationRequest;
import com.clickmunch.NotificationService.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrderEvent(OrderEvent event) {
        log.info("Received order event: {} for order {}", event.eventType(), event.orderId());

        switch (event.eventType()) {
            case "ORDER_CREATED" -> {
                // Notify the customer
                notificationService.createNotification(new CreateNotificationRequest(
                        event.customerId(),
                        event.restaurantId(),
                        "NEW_ORDER",
                        "Pedido recibido",
                        "Tu pedido #" + event.orderId() + " en " + event.restaurantName() +
                                " ha sido recibido y se está preparando. Total: $" + event.total(),
                        event.orderId()
                ));
            }
            case "ORDER_STATUS_CHANGED" -> {
                String title = switch (event.status()) {
                    case "Ready" -> "Pedido listo";
                    case "Delivered" -> "Pedido entregado";
                    case "Cancelled" -> "Pedido cancelado";
                    default -> "Estado del pedido actualizado";
                };
                String message = switch (event.status()) {
                    case "Ready" -> "Tu pedido #" + event.orderId() + " en " + event.restaurantName() + " está listo.";
                    case "Delivered" -> "Tu pedido #" + event.orderId() + " ha sido entregado. ¡Buen provecho!";
                    case "Cancelled" -> "Tu pedido #" + event.orderId() + " ha sido cancelado.";
                    default -> "Tu pedido #" + event.orderId() + " ahora está: " + event.status();
                };
                String type = "Ready".equals(event.status()) ? "ORDER_READY" : "ORDER_STATUS_CHANGED";

                notificationService.createNotification(new CreateNotificationRequest(
                        event.customerId(),
                        event.restaurantId(),
                        type,
                        title,
                        message,
                        event.orderId()
                ));
            }
            default -> log.warn("Unknown order event type: {}", event.eventType());
        }
    }

    @RabbitListener(queues = RabbitMQConfig.RESERVATION_QUEUE)
    public void handleReservationEvent(ReservationEvent event) {
        log.info("Received reservation event: {} for reservation {}", event.eventType(), event.reservationId());

        switch (event.eventType()) {
            case "RESERVATION_CONFIRMED" -> {
                notificationService.createNotification(new CreateNotificationRequest(
                        event.customerId(),
                        event.restaurantId(),
                        "RESERVATION_CONFIRMED",
                        "Reservación confirmada",
                        "Tu reservación en " + event.restaurantName() + " para " +
                                event.partySize() + " personas el " + event.reservationDate() +
                                " a las " + event.reservationTime() + " ha sido confirmada.",
                        null
                ));
            }
            case "RESERVATION_CANCELLED" -> {
                notificationService.createNotification(new CreateNotificationRequest(
                        event.customerId(),
                        event.restaurantId(),
                        "RESERVATION_CANCELLED",
                        "Reservación cancelada",
                        "Tu reservación en " + event.restaurantName() + " para el " +
                                event.reservationDate() + " a las " + event.reservationTime() +
                                " ha sido cancelada.",
                        null
                ));
            }
            default -> log.warn("Unknown reservation event type: {}", event.eventType());
        }
    }
}
