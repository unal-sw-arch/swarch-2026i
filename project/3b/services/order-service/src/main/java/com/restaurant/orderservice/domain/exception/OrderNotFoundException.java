package com.restaurant.orderservice.domain.exception;

public class OrderNotFoundException extends RuntimeException {

    private final Long orderId;

    public OrderNotFoundException(Long orderId) {
        super("Pedido con id " + orderId + " no encontrado");
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }
}
