package com.clickmunch.RestaurantService.dto;

public record RestaurantCardResponse(
        Long id,
        String name,
        String image,
        Double rating,
        String deliveryTime,
        String price,
        String badge,
        String category,
        String city,
        Double latitude,
        Double longitude,
        Boolean freeShipping,
        Double distanceKm
) {
}

