package com.clickmunch.OrderService.realtime;

import com.clickmunch.OrderService.dto.OrderResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publishes kitchen events to STOMP topics. Isolated from OrderService so the
 * service layer stays pure and the publisher can be easily mocked or swapped
 * for a different broker (e.g. RabbitMQ relay) later.
 *
 * Publication failures are caught and logged rather than propagated so that
 * a transient STOMP issue never causes an API error when the order has already
 * been persisted to the database.
 */
@Component
public class KitchenEventsPublisher {

    private static final Logger log = LoggerFactory.getLogger(KitchenEventsPublisher.class);
    private static final String TOPIC_PREFIX = "/topic/kitchen/";

    private final SimpMessagingTemplate messaging;

    public KitchenEventsPublisher(SimpMessagingTemplate messaging) {
        this.messaging = messaging;
    }

    public void publishCreated(OrderResponse order) {
        try {
            messaging.convertAndSend(topicFor(order), KitchenEvent.created(order));
        } catch (Exception ex) {
            log.warn("STOMP publish failed for ORDER_CREATED (order {}): {}",
                     order.id(), ex.getMessage());
        }
    }

    public void publishStatusChanged(OrderResponse order) {
        try {
            messaging.convertAndSend(topicFor(order), KitchenEvent.statusChanged(order));
        } catch (Exception ex) {
            log.warn("STOMP publish failed for ORDER_STATUS_CHANGED (order {}): {}",
                     order.id(), ex.getMessage());
        }
    }

    private String topicFor(OrderResponse order) {
        return TOPIC_PREFIX + order.restaurantId();
    }
}
