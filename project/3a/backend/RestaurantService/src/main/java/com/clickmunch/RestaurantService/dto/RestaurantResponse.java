package com.clickmunch.RestaurantService.dto;

public record RestaurantResponse(
        Long id,
        String name,
        String description,
        String phone,
        String email,
        String imageUrl,
        Long locationId
) {
}
