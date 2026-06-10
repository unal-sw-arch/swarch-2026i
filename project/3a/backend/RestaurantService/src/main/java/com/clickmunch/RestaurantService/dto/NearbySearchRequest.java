package com.clickmunch.RestaurantService.dto;

public record NearbySearchRequest(
    Double latitude,
    Double longitude,
    Double radiusInKm,
    Integer limit
) {
}
