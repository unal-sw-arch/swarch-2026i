package com.clickmunch.OrderService.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AddItemsRequest(
        @NotNull @Size(min = 1) List<@Valid ItemRequest> items
) {
    public record ItemRequest(
            @NotBlank String menuItemId,
            @NotBlank String productName,
            @NotNull @Positive Integer quantity,
            @NotNull @Positive BigDecimal unitPrice
    ) {}
}
