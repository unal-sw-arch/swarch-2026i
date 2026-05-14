package com.clickmunch.AuthService.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StaffInviteRequest(
        @NotNull Long restaurantId,
        @NotBlank @Email String email,
        @NotBlank String role
) {}
