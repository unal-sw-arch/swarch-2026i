package com.clickmunch.OrderService.event;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.clickmunch.OrderService.config.RabbitMQConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(OrderEvent event) {
        log.info("Publishing order.created event for order {}", event.orderId());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "order.created", event);
    }

    public void publishOrderStatusChanged(OrderEvent event) {
        log.info("Publishing order.status.changed event for order {} -> {}", event.orderId(), event.status());
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, "order.status.changed", event);
    }
}
