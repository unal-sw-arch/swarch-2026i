package com.clickmunch.OrderService.dto;

public record UpdateOrderRequest(
        String notes,
        String eta
) {}
