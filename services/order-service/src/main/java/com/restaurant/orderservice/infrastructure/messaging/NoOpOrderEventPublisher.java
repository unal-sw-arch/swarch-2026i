package com.restaurant.orderservice.infrastructure.messaging;

import com.restaurant.orderservice.domain.model.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * Stub de OrderEventPublisher activo mientras no exista la implementación RabbitMQ.
 * Fase 6 reemplaza este bean con RabbitMQOrderEventPublisher.
 * ConditionalOnMissingBean garantiza que Fase 6 lo desplace automáticamente.
 */
@Slf4j
@Component
@ConditionalOnMissingBean(name = "rabbitMQOrderEventPublisher")
public class NoOpOrderEventPublisher implements OrderEventPublisher {

    @Override
    public void publishOrderCreated(Order order) {
        log.warn("NoOpOrderEventPublisher.publishOrderCreated(orderId={}): stub — implementar en Fase 6", order.getId());
    }

    @Override
    public void publishOrderStatusChanged(Order order) {
        log.warn("NoOpOrderEventPublisher.publishOrderStatusChanged(orderId={}): stub — implementar en Fase 6", order.getId());
    }
}
