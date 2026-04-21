package com.clickmunch.RatingService.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateRestaurantRatingRequest(
        @NotNull Long customerId,
        String customerName,
        @NotNull Long restaurantId,
        String restaurantName,
        Long orderId,
        @NotNull @Min(1) @Max(5) Integer score,
        String review
) {}
