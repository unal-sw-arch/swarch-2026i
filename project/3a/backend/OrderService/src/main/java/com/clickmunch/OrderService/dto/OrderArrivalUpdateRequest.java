package com.clickmunch.OrderService.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OrderArrivalUpdateRequest(
        @NotNull @FutureOrPresent LocalDateTime requestedArrivalTime,
        @NotBlank @Size(max = 500) String message
) {
}