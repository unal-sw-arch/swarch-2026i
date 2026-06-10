package com.clickmunch.AuthService.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(max = 20) String phone,
        @Size(max = 500) String bio,
        @Size(max = 500) String profileImageUrl,
        String address,
        @Size(max = 100) String governmentId
) {}
