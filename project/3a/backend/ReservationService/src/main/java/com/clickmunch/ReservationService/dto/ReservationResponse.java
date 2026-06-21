package com.clickmunch.ReservationService.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationResponse(
        Long id,
        Long customerId,
        String customerName,
        Long restaurantId,
        String restaurantName,
        LocalDate reservationDate,
        LocalTime reservationTime,
        Integer partySize,
        String status,
        String notes,
        Long orderId,
        Long tableId,
        LocalDateTime checkedInAt,
        LocalDateTime createdAt
) {}
