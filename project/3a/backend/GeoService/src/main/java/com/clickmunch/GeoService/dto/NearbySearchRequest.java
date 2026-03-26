package com.clickmunch.GeoService.dto;

public record NearbySearchRequest(
    Double latitude,
    Double longitude,
    Double radiusInKm
) {
}
