package com.clickmunch.RestaurantService.dto;

public record MenuItemResponse(
        String id,
        String categoryId,
        String name,
        String description,
        Double price,
        String imageUrl
) {
}
