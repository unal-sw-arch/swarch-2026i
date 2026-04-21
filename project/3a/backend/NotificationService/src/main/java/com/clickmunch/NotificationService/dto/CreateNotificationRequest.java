package com.clickmunch.NotificationService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(
        @NotNull Long userId,
        Long restaurantId,
        @NotBlank String type,
        @NotBlank String title,
        @NotBlank String message,
        Long orderId
) {}
