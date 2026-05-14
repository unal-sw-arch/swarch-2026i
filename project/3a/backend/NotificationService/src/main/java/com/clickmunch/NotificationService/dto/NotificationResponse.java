package com.clickmunch.NotificationService.dto;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long userId,
        Long restaurantId,
        String type,
        String title,
        String message,
        Boolean read,
        Long orderId,
        LocalDateTime createdAt
) {}
