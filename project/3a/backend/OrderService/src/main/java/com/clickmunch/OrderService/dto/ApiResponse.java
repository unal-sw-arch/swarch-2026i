package com.clickmunch.OrderService.dto;

public record ApiResponse<T>(
        String message,
        T data
) {
}
