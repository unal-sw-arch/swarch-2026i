package com.clickmunch.RestaurantService.dto;

public record CreateRestaurantRequest(
        Long ownerId,
        String name,
        String description,
        String phone,
        String email,
        String imageUrl,
        String placeType,
        Double latitude,
        Double longitude
) {
}
