package com.clickmunch.RestaurantService.dto;

import java.time.LocalDateTime;

public record RestaurantAdminResponse(
        Long id,
        Long restaurantId,
        Long userId,
        LocalDateTime assignedAt
) {}
