package com.clickmunch.AuthService.dto;

public record LoginResponse(
        String token,
        String username,
        String role
) {
}
