package com.clickmunch.OrderService.realtime;

import com.clickmunch.OrderService.dto.OrderResponse;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes kitchen events to STOMP topics. Isolated from OrderService so the
 * service layer stays pure and the publisher can be easily mocked or swapped
 * for a different broker (e.g. RabbitMQ relay) later.
 */
@Component
public class KitchenEventsPublisher {

    private static final String TOPIC_PREFIX = "/topic/kitchen/";

    private final SimpMessagingTemplate messaging;

    public KitchenEventsPublisher(SimpMessagingTemplate messaging) {
        this.messaging = messaging;
    }

    public void publishCreated(OrderResponse order) {
        messaging.convertAndSend(topicFor(order), KitchenEvent.created(order));
    }

    public void publishStatusChanged(OrderResponse order) {
        messaging.convertAndSend(topicFor(order), KitchenEvent.statusChanged(order));
    }

    private String topicFor(OrderResponse order) {
        return TOPIC_PREFIX + order.restaurantId();
    }
}
