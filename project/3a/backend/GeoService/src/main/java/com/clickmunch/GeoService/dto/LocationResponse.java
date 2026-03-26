package com.clickmunch.GeoService.dto;

public record LocationResponse(
        Long id,
        Long restaurantId,
        String name,
        String type,
        Double latitude,
        Double longitude,
        Double distanceMeters
) {
}
