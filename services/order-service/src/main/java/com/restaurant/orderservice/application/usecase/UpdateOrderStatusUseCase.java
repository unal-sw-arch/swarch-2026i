package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.domain.model.Order;
import com.restaurant.orderservice.domain.model.OrderStatus;
import com.restaurant.orderservice.domain.repository.OrderRepository;
import com.restaurant.orderservice.infrastructure.client.TrackingServiceClient;
import com.restaurant.orderservice.infrastructure.client.dto.ActivityEventDto;
import com.restaurant.orderservice.infrastructure.messaging.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UpdateOrderStatusUseCase {

    private final OrderRepository     orderRepository;
    private final TrackingServiceClient trackingServiceClient;
    private final OrderEventPublisher orderEventPublisher;

    /**
     * Updates the persisted status of an order.
     * Called by the RabbitMQ consumer when the kitchen-service publishes
     * an order.status.changed event.
     *
     * @param orderId   numeric order id (string coming from the event)
     * @param newStatus target status (e.g. "IN_PREPARATION", "READY")
     */
    @Transactional
    public void execute(String orderId, String newStatus) {
        Long id;
        try {
            id = Long.parseLong(orderId);
        } catch (NumberFormatException e) {
            log.warn("[UpdateOrderStatus] Ignoring event with non-numeric orderId='{}'", orderId);
            return;
        }

        OrderStatus status;
        try {
            status = OrderStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("[UpdateOrderStatus] Unknown status '{}' for order {}. Ignoring.", newStatus, orderId);
            return;
        }

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            log.warn("[UpdateOrderStatus] Order {} not found. Ignoring status update to {}.", orderId, newStatus);
            return;
        }

        if (order.getStatus() == status) {
            log.debug("[UpdateOrderStatus] Order {} already in status {}. Skipping.", orderId, newStatus);
            return;
        }

        order.setStatus(status);
        orderRepository.save(order);

        // Publish the canonical ORDER_STATUS_CHANGED event so downstream consumers
        // (customer app, notification service) stay in sync.
        orderEventPublisher.publishOrderStatusChanged(order);

        ActivityEventDto event = ActivityEventDto.builder()
            .eventType("ORDER_STATUS_CHANGED")
            .entityType("ORDER")
            .entityId(order.getId().toString())
            .restaurantId(order.getRestaurantId())
            .orderId(order.getId().toString())
            .timestamp(java.time.Instant.now().toString())
            .sourceService("order-service")
            .payload(java.util.Map.of("status", newStatus.toUpperCase()))
            .build();
        trackingServiceClient.publishActivityEvent(event);

        log.info("[UpdateOrderStatus] Order {} updated to status {}", orderId, newStatus);
    }
}
