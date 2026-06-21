package com.clickmunch.RatingService.dto;

import java.time.LocalDateTime;

public record RestaurantRatingResponse(
        Long id,
        Long customerId,
        String customerName,
        Long restaurantId,
        String restaurantName,
        Long orderId,
        Integer score,
        String review,
        LocalDateTime createdAt
) {}
