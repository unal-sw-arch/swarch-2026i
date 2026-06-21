package com.clickmunch.RestaurantService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StaffAssignmentRequest(
        @NotNull Long userId,
        @NotBlank String role
) {}
