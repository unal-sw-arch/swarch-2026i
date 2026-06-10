package com.clickmunch.OrderService.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequest(
        @NotNull Long restaurantId,
        @NotNull Integer tableNumber,
        String notes,
        @NotEmpty @Valid List<CreateOrderItemRequest> items
) {
}
