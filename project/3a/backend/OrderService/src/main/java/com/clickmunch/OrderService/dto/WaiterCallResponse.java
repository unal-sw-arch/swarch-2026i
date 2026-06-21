package com.clickmunch.OrderService.dto;

import java.time.LocalDateTime;

public record WaiterCallResponse(
        Long id,
        Long orderId,
        Long tableId,
        Long restaurantId,
        String status,
        String message,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {}
