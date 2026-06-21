package com.clickmunch.AuthService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StaffRegisterRequest(
        @NotBlank String inviteToken,
        @NotBlank String name,
        @NotBlank String username,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String governmentId,
        String profileImageUrl,
        String address,
        @Size(max = 20) String phone
) {}
