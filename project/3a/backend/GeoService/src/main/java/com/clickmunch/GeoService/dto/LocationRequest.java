package com.clickmunch.GeoService.dto;

import com.clickmunch.GeoService.entity.LocationType;

public record LocationRequest(
        Long restaurantId,
        String name,
        String type,
        Double latitude,
        Double longitude
) {
}
