package com.clickmunch.RestaurantService.dto;

public record LocationDto(
        Long id,
        String name,
        String type,
        Double latitude,
        Double longitude,
        String address
) {
}
