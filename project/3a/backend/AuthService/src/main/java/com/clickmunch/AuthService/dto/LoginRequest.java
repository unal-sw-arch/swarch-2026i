package com.clickmunch.AuthService.dto;

public record LoginRequest(
        String username,
        String password
) {
}
