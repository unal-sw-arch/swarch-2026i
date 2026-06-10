package com.clickmunch.OrderService.dto;

public record OrderItemResponse(
        Long id,
        String itemName,
        String notes
) {
}
