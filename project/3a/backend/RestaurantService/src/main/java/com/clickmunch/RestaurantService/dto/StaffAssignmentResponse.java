package com.clickmunch.RestaurantService.dto;

import java.time.LocalDateTime;

public record StaffAssignmentResponse(
        Long id,
        Long restaurantId,
        Long userId,
        String role,
        Boolean active,
        LocalDateTime assignedAt
) {}
