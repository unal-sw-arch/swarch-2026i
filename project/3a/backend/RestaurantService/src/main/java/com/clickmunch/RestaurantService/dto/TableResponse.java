package com.clickmunch.RestaurantService.dto;

public record TableResponse(
        Long id,
        Long restaurantId,
        String tableNumber,
        Integer seats,
        String status
) {}
