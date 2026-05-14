package com.clickmunch.ReservationService.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("reservations")
public class Reservation {
    @Id
    private Long id;
    private Long customerId;
    private String customerName;
    private Long restaurantId;
    private String restaurantName;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer partySize;
    private ReservationStatus status;
    private String notes;
    private Long orderId;
    private Long tableId;
    private LocalDateTime checkedInAt;
    private LocalDateTime createdAt;
}
