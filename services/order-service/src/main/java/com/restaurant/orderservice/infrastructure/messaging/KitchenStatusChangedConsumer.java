package com.restaurant.orderservice.infrastructure.messaging;

import com.restaurant.orderservice.application.usecase.UpdateOrderStatusUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.messaging.handler.annotation.Payload;

import java.util.Map;

/**
 * Consumes order.status.changed events published by the kitchen-service.
 * When the kitchen marks an order as IN_PREPARATION or READY, this consumer
 * updates the order's status in the order-service database, keeping the
 * customer-facing view in sync.
 */
@Slf4j
@Configuration
@Profile("!local")
@RequiredArgsConstructor
public class KitchenStatusChangedConsumer {

    private static final String QUEUE_NAME = "order-service.kitchen-status-changed";

    private final UpdateOrderStatusUseCase updateOrderStatusUseCase;

    // ── Queue / Binding declarations ──────────────────────────────────────────

    /**
     * The shared event bus exchange used by ALL services (kitchen, order, notification...).
     * kitchen-service publishes order.status.changed to "deliunal.events".
     * This bean is separate from the order-service's own "order.exchange".
     */
    @Bean
    public TopicExchange sharedDeliUnalExchange() {
        // durable=true, autoDelete=false — mirrors kitchen-service's ExchangeDeclare call
        return new TopicExchange("deliunal.events", true, false);
    }

    @Bean
    public Queue kitchenStatusChangedQueue() {
        return new Queue(QUEUE_NAME, true); // durable
    }

    @Bean
    public Binding kitchenStatusChangedBinding(
            Queue kitchenStatusChangedQueue,
            TopicExchange sharedDeliUnalExchange,
            @Value("${app.rabbitmq.routing-key.order-status-changed}") String routingKey) {
        return BindingBuilder
                .bind(kitchenStatusChangedQueue)
                .to(sharedDeliUnalExchange)
                .with(routingKey);
    }

    // ── Consumer ──────────────────────────────────────────────────────────────

    @RabbitListener(queues = QUEUE_NAME)
    public void onKitchenStatusChanged(@Payload Map<String, Object> event) {
        try {
            String orderId  = extractString(event, "orderId", "entityId");
            String newStatus = extractStatusFromEvent(event);

            if (orderId == null || newStatus == null) {
                log.warn("[KitchenStatusConsumer] Incomplete event — orderId={}, status={}. Skipping.", orderId, newStatus);
                return;
            }

            log.info("[KitchenStatusConsumer] Received status change: order {} → {}", orderId, newStatus);
            updateOrderStatusUseCase.execute(orderId, newStatus);

        } catch (Exception e) {
            // Log and discard — never re-queue to avoid poison message loops
            log.error("[KitchenStatusConsumer] Failed to process event: {}. Error: {}", event, e.getMessage(), e);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * The kitchen-service publishes a flat event:
     * { "orderId": "10", "newStatus": "IN_PREPARATION", "previousStatus": "CREATED",
     *   "eventType": "ORDER_STATUS_CHANGED", "sourceService": "kitchen-service", ... }
     * Fall back to a nested "payload.newStatus" or top-level "status" for flexibility.
     */
    @SuppressWarnings("unchecked")
    private String extractStatusFromEvent(Map<String, Object> event) {
        // Kitchen-service sends newStatus at the top level
        Object topNew = event.get("newStatus");
        if (topNew != null) return topNew.toString();

        // Fallback: nested payload wrapper (order-service's own format)
        Object payload = event.get("payload");
        if (payload instanceof Map) {
            Map<String, Object> inner = (Map<String, Object>) payload;
            Object s = inner.getOrDefault("newStatus", inner.get("status"));
            if (s != null) return s.toString();
        }

        // Last resort: plain "status" field
        Object top = event.get("status");
        return top != null ? top.toString() : null;
    }

    private String extractString(Map<String, Object> event, String... keys) {
        for (String key : keys) {
            Object value = event.get(key);
            if (value != null) return value.toString();
        }
        return null;
    }
}
