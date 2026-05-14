package com.clickmunch.NotificationService.event;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationEvent(
        String eventType,
        Long reservationId,
        Long customerId,
        String customerName,
        Long restaurantId,
        String restaurantName,
        String status,
        LocalDate reservationDate,
        LocalTime reservationTime,
        Integer partySize,
        LocalDateTime timestamp
) implements Serializable {}
