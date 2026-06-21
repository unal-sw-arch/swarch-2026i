package com.clickmunch.RestaurantService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateTableRequest(
        @NotBlank String tableNumber,
        @NotNull @Positive Integer seats,
        @NotBlank String status,
        @PositiveOrZero Integer layoutX,
        @PositiveOrZero Integer layoutY,
        @NotNull @Positive Integer layoutWidth,
        @NotNull @Positive Integer layoutHeight,
        @NotBlank String layoutShape
) {}
