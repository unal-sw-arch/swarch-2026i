package com.clickmunch.ReservationService.dto;

import java.time.LocalTime;
import java.util.List;

public record SuggestedTimesResponse(
        Long restaurantId,
        String date,
        Integer partySize,
        List<TimeSlot> availableSlots
) {
    public record TimeSlot(
            LocalTime time,
            int availableTables
    ) {}
}
