package com.clickmunch.ReservationService.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateReservationStatusRequest(
        @NotBlank String status
) {}
