package com.restaurant.orderservice.infrastructure.messaging;

import com.restaurant.orderservice.domain.model.Order;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Component("rabbitMQOrderEventPublisher")
public class RabbitMQOrderEventPublisher implements OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final String exchange;
    private final String rkOrderCreated;
    private final String rkOrderStatusChanged;

    public RabbitMQOrderEventPublisher(
            RabbitTemplate rabbitTemplate,
            @Value("${app.rabbitmq.exchange}") String exchange,
            @Value("${app.rabbitmq.routing-key.order-created}") String rkOrderCreated,
            @Value("${app.rabbitmq.routing-key.order-status-changed}") String rkOrderStatusChanged) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.rkOrderCreated = rkOrderCreated;
        this.rkOrderStatusChanged = rkOrderStatusChanged;
    }

    @Override
    public void publishOrderCreated(Order order) {
        Map<String, Object> event = buildBaseEvent("ORDER_CREATED", order);
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", order.getStatus().name());
        payload.put("totalAmount", order.getTotalAmount());
        event.put("payload", payload);

        rabbitTemplate.convertAndSend(exchange, rkOrderCreated, event);
    }

    @Override
    public void publishOrderStatusChanged(Order order) {
        Map<String, Object> event = buildBaseEvent("ORDER_STATUS_CHANGED", order);
        Map<String, Object> payload = new HashMap<>();
        payload.put("status", order.getStatus().name());
        event.put("payload", payload);

        rabbitTemplate.convertAndSend(exchange, rkOrderStatusChanged, event);
    }

    private Map<String, Object> buildBaseEvent(String eventType, Order order) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventType", eventType);
        event.put("orderId", String.valueOf(order.getId()));
        event.put("customerId", String.valueOf(order.getCustomerId()));
        event.put("restaurantId", String.valueOf(order.getRestaurantId()));
        // Use current time as event timestamp
        event.put("timestamp", Instant.now().toString());
        return event;
    }
}
