package com.clickmunch.AuthService.dto;

public record UserInfoResponse(
        Long id,
        String name,
        String username,
        String email,
        String role,
        String approvalStatus,
        String phone,
        String bio,
        String profileImageUrl,
        String address,
        String governmentId
) {
}
