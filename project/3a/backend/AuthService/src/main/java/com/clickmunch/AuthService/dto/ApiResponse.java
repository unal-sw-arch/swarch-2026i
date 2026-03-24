package com.clickmunch.AuthService.dto;

public record ApiResponse<T>(
        String message,
        T data
) {
}
