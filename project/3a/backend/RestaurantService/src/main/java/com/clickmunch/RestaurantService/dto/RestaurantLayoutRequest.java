package com.clickmunch.RestaurantService.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RestaurantLayoutRequest(
        @NotNull @Min(4) @Max(32) Integer layoutCols,
        @NotNull @Min(4) @Max(32) Integer layoutRows
) {
}
