package com.clickmunch.RestaurantService.dto;

import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OperatingHoursRequest(
        @NotBlank String dayOfWeek,
        @NotNull LocalTime openTime,
        @NotNull LocalTime closeTime
) {}
