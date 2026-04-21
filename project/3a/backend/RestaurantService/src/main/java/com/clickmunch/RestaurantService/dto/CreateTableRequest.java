package com.clickmunch.RestaurantService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateTableRequest(
        @NotBlank String tableNumber,
        @NotNull @Positive Integer seats
) {}
