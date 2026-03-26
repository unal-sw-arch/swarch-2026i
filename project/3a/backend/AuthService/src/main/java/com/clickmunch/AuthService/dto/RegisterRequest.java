package com.clickmunch.AuthService.dto;

public record RegisterRequest(
        String name,
        String email,
        String username,
        String password,
        String role
) {
}
