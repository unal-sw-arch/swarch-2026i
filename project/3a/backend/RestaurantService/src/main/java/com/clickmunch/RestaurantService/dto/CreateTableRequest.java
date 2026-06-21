package com.clickmunch.RestaurantService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateTableRequest(
        @NotBlank String tableNumber,
        @NotNull @Positive Integer seats,
        @PositiveOrZero Integer layoutX,
        @PositiveOrZero Integer layoutY,
        @Positive Integer layoutWidth,
        @Positive Integer layoutHeight,
        String layoutShape
) {}
