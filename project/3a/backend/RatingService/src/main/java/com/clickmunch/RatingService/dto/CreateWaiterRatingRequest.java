package com.clickmunch.RatingService.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateWaiterRatingRequest(
        @NotNull Long customerId,
        String customerName,
        @NotNull Long waiterId,
        String waiterName,
        @NotNull Long restaurantId,
        Long orderId,
        @NotNull @Min(1) @Max(5) Integer score,
        String comment
) {}
