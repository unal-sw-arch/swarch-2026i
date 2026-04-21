package com.clickmunch.ReservationService.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateReservationRequest(
        @NotNull Long customerId,
        @NotBlank String customerName,
        @NotNull Long restaurantId,
        @NotBlank String restaurantName,
        @NotNull @FutureOrPresent LocalDate reservationDate,
        @NotNull LocalTime reservationTime,
        @NotNull @Positive Integer partySize,
        String notes
) {}
