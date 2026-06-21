package com.clickmunch.ReservationService.event;

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
) implements Serializable {

    public static ReservationEvent confirmed(Long reservationId, Long customerId, String customerName,
                                             Long restaurantId, String restaurantName,
                                             LocalDate date, LocalTime time, Integer partySize) {
        return new ReservationEvent("RESERVATION_CONFIRMED", reservationId, customerId, customerName,
                restaurantId, restaurantName, "Confirmada", date, time, partySize, LocalDateTime.now());
    }

    public static ReservationEvent cancelled(Long reservationId, Long customerId, String customerName,
                                             Long restaurantId, String restaurantName,
                                             LocalDate date, LocalTime time, Integer partySize) {
        return new ReservationEvent("RESERVATION_CANCELLED", reservationId, customerId, customerName,
                restaurantId, restaurantName, "Cancelada", date, time, partySize, LocalDateTime.now());
    }
}
