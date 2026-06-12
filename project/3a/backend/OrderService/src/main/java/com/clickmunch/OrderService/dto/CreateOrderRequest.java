package com.clickmunch.OrderService.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull Long restaurantId,
        @NotNull Integer tableNumber,
        Long customerId,
        String customerName,
        BigDecimal totalAmount,
        String notes,
        @NotEmpty @Valid List<CreateOrderItemRequest> items
) {
}
