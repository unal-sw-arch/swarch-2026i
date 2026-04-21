package com.clickmunch.RestaurantService.dto;

import java.time.LocalTime;

public record OperatingHoursResponse(
        Long id,
        Long restaurantId,
        String dayOfWeek,
        LocalTime openTime,
        LocalTime closeTime
) {}
