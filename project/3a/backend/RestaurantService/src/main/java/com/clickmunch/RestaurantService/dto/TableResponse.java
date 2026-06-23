package com.clickmunch.RestaurantService.dto;

public record TableResponse(
        Long id,
        Long restaurantId,
        String tableNumber,
        Integer seats,
        String status,
        Integer layoutX,
        Integer layoutY,
        Integer layoutWidth,
        Integer layoutHeight,
        String layoutShape
) {}
