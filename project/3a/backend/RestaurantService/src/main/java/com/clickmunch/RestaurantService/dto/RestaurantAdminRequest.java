package com.clickmunch.RestaurantService.dto;

import jakarta.validation.constraints.NotNull;

public record RestaurantAdminRequest(
        @NotNull Long userId
) {}
