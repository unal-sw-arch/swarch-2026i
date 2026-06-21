package com.restaurant.orderservice.infrastructure.messaging;

import com.restaurant.orderservice.domain.model.Order;

/**
 * Contrato de publicación async de eventos del Order Service.
 * La implementación concreta (RabbitMQ) vive en RabbitMQOrderEventPublisher — Fase 6.
 * La lógica de negocio solo conoce esta interfaz, nunca el broker concreto.
 */
public interface OrderEventPublisher {

    // Publica ORDER_CREATED al broker tras persistir el pedido
    void publishOrderCreated(Order order);

    // Publica ORDER_STATUS_CHANGED al broker cuando cambia el estado
    void publishOrderStatusChanged(Order order);
}
