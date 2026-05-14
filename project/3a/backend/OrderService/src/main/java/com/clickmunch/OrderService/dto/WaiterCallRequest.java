package com.clickmunch.OrderService.dto;

import jakarta.validation.constraints.NotNull;

public record WaiterCallRequest(
        @NotNull Long orderId,
        Long tableId,
        @NotNull Long restaurantId,
        String message
) {}
