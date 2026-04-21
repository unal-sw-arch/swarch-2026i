package com.restaurant.orderservice.domain.exception;

public class RestaurantNotFoundException extends RuntimeException {

    private final Long restaurantId;

    public RestaurantNotFoundException(Long restaurantId) {
        super("Restaurante con id " + restaurantId + " no encontrado");
        this.restaurantId = restaurantId;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }
}
