package com.clickmunch.RatingService.dto;

import java.time.LocalDateTime;

public record WaiterRatingResponse(
        Long id,
        Long customerId,
        String customerName,
        Long waiterId,
        String waiterName,
        Long restaurantId,
        Long orderId,
        Integer score,
        String comment,
        LocalDateTime createdAt
) {}
