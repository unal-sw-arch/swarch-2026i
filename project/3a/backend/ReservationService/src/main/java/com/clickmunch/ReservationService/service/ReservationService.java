package com.clickmunch.ReservationService.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clickmunch.ReservationService.client.RestaurantClient;
import com.clickmunch.ReservationService.dto.CreateReservationRequest;
import com.clickmunch.ReservationService.dto.LinkOrderRequest;
import com.clickmunch.ReservationService.dto.ReservationResponse;
import com.clickmunch.ReservationService.dto.SuggestedTimesResponse;
import com.clickmunch.ReservationService.dto.UpdateReservationStatusRequest;
import com.clickmunch.ReservationService.entity.Reservation;
import com.clickmunch.ReservationService.entity.ReservationStatus;
import com.clickmunch.ReservationService.event.ReservationEvent;
import com.clickmunch.ReservationService.event.ReservationEventPublisher;
import com.clickmunch.ReservationService.repository.ReservationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);
    private static final ZoneId RESERVATION_ZONE = ZoneId.of("America/Bogota");
    private static final int RESERVATION_DURATION_MINUTES = 45;
    private static final int MIN_RESERVATION_ADVANCE_MINUTES = 60;

    private final ReservationRepository reservationRepository;
    private final RestaurantClient restaurantClient;
    private final ReservationEventPublisher eventPublisher;

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request) {
        validateReservationLeadTime(request.reservationDate(), request.reservationTime());
        validateRestaurantSchedule(request.restaurantId(), request.reservationDate(), request.reservationTime());

        Reservation reservation = Reservation.builder()
                .customerId(request.customerId())
                .customerName(request.customerName())
                .restaurantId(request.restaurantId())
                .restaurantName(request.restaurantName())
                .reservationDate(request.reservationDate())
                .reservationTime(request.reservationTime())
                .partySize(request.partySize())
                .status(ReservationStatus.Pendiente)
                .notes(request.notes())
                .createdAt(LocalDateTime.now())
                .build();

        Long tableId = findBestAvailableTable(
                request.restaurantId(),
                request.reservationDate(),
                request.reservationTime(),
                request.partySize()
        ).orElseThrow(() -> new IllegalStateException("No suitable table is available for that time"));
        reservation.setTableId(tableId);

        Reservation saved = reservationRepository.save(reservation);
        updateTableStatus(tableId, "RESERVED", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public ReservationResponse assignTable(Long id, Long tableId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
        validateTableScheduleAvailability(reservation, tableId);
        Long previousTableId = reservation.getTableId();
        reservation.setTableId(tableId);
        Reservation updated = reservationRepository.save(reservation);
        if (previousTableId != null && !previousTableId.equals(tableId)) {
            releaseTableIfNoActiveReservations(previousTableId, updated.getId());
        }
        updateTableStatus(tableId, "RESERVED", updated.getId());
        return toResponse(updated);
    }

    public List<Map<String, Object>> getAvailableTables(Long restaurantId, Integer partySize) {
        return restaurantClient.getAvailableTables(restaurantId, partySize);
    }

    public ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
        return toResponse(reservation);
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAllOrderedByDate().stream()
                .map(this::toResponse).toList();
    }

    public List<ReservationResponse> getReservationsByRestaurant(Long restaurantId) {
        return reservationRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toResponse).toList();
    }

    public List<ReservationResponse> getReservationsByCustomer(Long customerId) {
        return reservationRepository.findByCustomerId(customerId).stream()
                .map(this::toResponse).toList();
    }

    public List<ReservationResponse> getReservationsByStatus(String status) {
        return reservationRepository.findByStatus(status).stream()
                .map(this::toResponse).toList();
    }

    public List<ReservationResponse> getReservationsByRestaurantAndDate(Long restaurantId, LocalDate date) {
        return reservationRepository.findByRestaurantIdAndDate(restaurantId, date).stream()
                .map(this::toResponse).toList();
    }

    @Transactional
    public ReservationResponse updateStatus(Long id, UpdateReservationStatusRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));

        ReservationStatus newStatus = ReservationStatus.valueOf(request.status());
        reservation.setStatus(newStatus);

        Reservation updated = reservationRepository.save(reservation);
        syncTableStatusForReservation(updated);

        // Publish async event for notifications
        if (newStatus == ReservationStatus.Confirmada) {
            eventPublisher.publishReservationConfirmed(ReservationEvent.confirmed(
                    updated.getId(), updated.getCustomerId(), updated.getCustomerName(),
                    updated.getRestaurantId(), updated.getRestaurantName(),
                    updated.getReservationDate(), updated.getReservationTime(), updated.getPartySize()));
        } else if (newStatus == ReservationStatus.Cancelada) {
            eventPublisher.publishReservationCancelled(ReservationEvent.cancelled(
                    updated.getId(), updated.getCustomerId(), updated.getCustomerName(),
                    updated.getRestaurantId(), updated.getRestaurantName(),
                    updated.getReservationDate(), updated.getReservationTime(), updated.getPartySize()));
        }

        return toResponse(updated);
    }

    @Transactional
    public ReservationResponse linkOrder(Long id, LinkOrderRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));

        reservation.setOrderId(request.orderId());
        Reservation updated = reservationRepository.save(reservation);
        return toResponse(updated);
    }

    @Transactional
    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new IllegalArgumentException("Reservation not found: " + id);
        }
        reservationRepository.deleteById(id);
    }

    // ─── Check-In ───

    @Transactional
    public ReservationResponse checkIn(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));

        if (reservation.getStatus() != ReservationStatus.Confirmada) {
            throw new IllegalStateException("Only confirmed reservations can be checked in. Current status: " + reservation.getStatus());
        }

        reservation.setStatus(ReservationStatus.CheckedIn);
        reservation.setCheckedInAt(LocalDateTime.now());
        Reservation updated = reservationRepository.save(reservation);
        if (updated.getTableId() != null) {
            updateTableStatus(updated.getTableId(), "OCCUPIED", updated.getId());
        }
        return toResponse(updated);
    }

    // ─── Auto-Release: runs every minute ───

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void expireOverdueReservations() {
        List<Reservation> overdue = reservationRepository.findOverdueConfirmedReservations();
        for (Reservation reservation : overdue) {
            reservation.setStatus(ReservationStatus.NoShow);
            reservationRepository.save(reservation);

            // Release the table if one was assigned
            if (reservation.getTableId() != null) {
                releaseTableIfNoActiveReservations(reservation.getTableId(), reservation.getId());
            }

            log.info("Auto-released reservation {} (no check-in within 10 minutes)", reservation.getId());
        }
    }

    // ─── Suggested Available Times ───

    public SuggestedTimesResponse suggestAvailableTimes(Long restaurantId, LocalDate date, Integer partySize) {
        OperatingWindow operatingWindow = getOperatingWindow(restaurantId, date);
        if (operatingWindow == null) {
            return new SuggestedTimesResponse(restaurantId, date.toString(), partySize, List.of());
        }
        List<TableCandidate> candidateTables = getCandidateTables(restaurantId, partySize);

        // Generate 30-minute time slots and count available tables for each.
        List<SuggestedTimesResponse.TimeSlot> slots = new ArrayList<>();

        for (LocalTime slotTime = operatingWindow.openTime();
                !slotTime.plusMinutes(RESERVATION_DURATION_MINUTES).isAfter(operatingWindow.closeTime());
                slotTime = slotTime.plusMinutes(30)) {
            final LocalTime currentSlot = slotTime;
            if (!hasMinimumLeadTime(date, currentSlot)) {
                continue;
            }
            int available = (int) candidateTables.stream()
                    .filter(table -> isTableAvailableForSchedule(table.id(), date, currentSlot, null))
                    .count();
            if (available > 0) {
                slots.add(new SuggestedTimesResponse.TimeSlot(currentSlot, available));
            }
        }

        return new SuggestedTimesResponse(restaurantId, date.toString(), partySize, slots);
    }

    private void syncTableStatusForReservation(Reservation reservation) {
        if (reservation.getTableId() == null) {
            return;
        }

        switch (reservation.getStatus()) {
            case Confirmada -> updateTableStatus(reservation.getTableId(), "RESERVED", reservation.getId());
            case CheckedIn -> updateTableStatus(reservation.getTableId(), "OCCUPIED", reservation.getId());
            case Cancelada, Completada, NoShow -> releaseTableIfNoActiveReservations(reservation.getTableId(), reservation.getId());
            case Pendiente -> {
                // A pending reservation keeps its assigned table reserved once a manager assigns it.
            }
        }
    }

    private Optional<Long> findBestAvailableTable(Long restaurantId, LocalDate date, LocalTime reservationTime, Integer partySize) {
        return getCandidateTables(restaurantId, partySize).stream()
                .filter(table -> isTableAvailableForSchedule(table.id(), date, reservationTime, null))
                .min(Comparator
                        .comparingInt((TableCandidate table) -> Math.abs(table.seats() - partySize))
                        .thenComparingInt(TableCandidate::seats)
                        .thenComparingLong(TableCandidate::id))
                .map(TableCandidate::id);
    }

    private List<TableCandidate> getCandidateTables(Long restaurantId, Integer partySize) {
        int maxSeats = Math.max(partySize, (int) Math.floor(partySize * 1.5));
        return restaurantClient.getAllTables(restaurantId).stream()
                .map(this::toTableCandidate)
                .filter(table -> table.seats() >= partySize)
                .filter(table -> table.seats() <= maxSeats)
                .filter(table -> !"OCCUPIED".equalsIgnoreCase(table.status()))
                .filter(table -> !"CLEANING".equalsIgnoreCase(table.status()))
                .sorted(Comparator
                        .comparingInt((TableCandidate table) -> Math.abs(table.seats() - partySize))
                        .thenComparingInt(TableCandidate::seats)
                        .thenComparingLong(TableCandidate::id))
                .toList();
    }

    private TableCandidate toTableCandidate(Map<String, Object> table) {
        return new TableCandidate(
                ((Number) table.get("id")).longValue(),
                ((Number) table.get("seats")).intValue(),
                String.valueOf(table.getOrDefault("status", "AVAILABLE"))
        );
    }

    private boolean isTableAvailableForSchedule(Long tableId, LocalDate date, LocalTime reservationTime, Long reservationId) {
        return reservationRepository
                .findByTableIdAndDate(tableId, date)
                .stream()
                .filter(existing -> reservationId == null || !existing.getId().equals(reservationId))
                .filter(this::blocksTableSchedule)
                .noneMatch(existing -> overlaps(reservationTime, existing.getReservationTime()));
    }

    private void validateTableScheduleAvailability(Reservation reservation, Long tableId) {
        if (reservation.getStatus() == ReservationStatus.Cancelada ||
                reservation.getStatus() == ReservationStatus.Completada ||
                reservation.getStatus() == ReservationStatus.NoShow) {
            throw new IllegalStateException("Cannot assign a table to a terminal reservation");
        }

        if (!isTableAvailableForSchedule(
                tableId,
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                reservation.getId()
        )) {
            throw new IllegalStateException("Table already has a reservation in that time window");
        }
    }

    private void validateReservationLeadTime(LocalDate date, LocalTime reservationTime) {
        if (!hasMinimumLeadTime(date, reservationTime)) {
            throw new IllegalStateException("Reservations must be made at least 1 hour in advance");
        }
    }

    private boolean hasMinimumLeadTime(LocalDate date, LocalTime reservationTime) {
        LocalDateTime requestedAt = LocalDateTime.of(date, reservationTime);
        LocalDateTime earliestReservationAt = LocalDateTime.now(RESERVATION_ZONE)
                .plusMinutes(MIN_RESERVATION_ADVANCE_MINUTES);
        return !requestedAt.isBefore(earliestReservationAt);
    }

    private void validateRestaurantSchedule(Long restaurantId, LocalDate date, LocalTime reservationTime) {
        OperatingWindow operatingWindow = getOperatingWindow(restaurantId, date);
        if (operatingWindow == null) {
            throw new IllegalStateException("Restaurant is closed on that day");
        }

        LocalTime reservationEnd = reservationTime.plusMinutes(RESERVATION_DURATION_MINUTES);
        if (reservationTime.isBefore(operatingWindow.openTime()) || reservationEnd.isAfter(operatingWindow.closeTime())) {
            throw new IllegalStateException("Reservation time is outside restaurant operating hours");
        }
    }

    private OperatingWindow getOperatingWindow(Long restaurantId, LocalDate date) {
        String dayOfWeek = date.getDayOfWeek().name();
        List<Map<String, Object>> operatingHours = restaurantClient.getOperatingHours(restaurantId);
        for (Map<String, Object> hours : operatingHours) {
            Object day = hours.get("dayOfWeek");
            if (day != null && day.toString().equalsIgnoreCase(dayOfWeek)) {
                return new OperatingWindow(
                        LocalTime.parse(hours.get("openTime").toString()),
                        LocalTime.parse(hours.get("closeTime").toString())
                );
            }
        }
        return null;
    }

    private boolean blocksTableSchedule(Reservation reservation) {
        return reservation.getStatus() == ReservationStatus.Pendiente ||
                reservation.getStatus() == ReservationStatus.Confirmada ||
                reservation.getStatus() == ReservationStatus.CheckedIn;
    }

    private boolean overlaps(LocalTime requestedStart, LocalTime existingStart) {
        LocalTime requestedEnd = requestedStart.plusMinutes(RESERVATION_DURATION_MINUTES);
        LocalTime existingEnd = existingStart.plusMinutes(RESERVATION_DURATION_MINUTES);
        return requestedStart.isBefore(existingEnd) && existingStart.isBefore(requestedEnd);
    }

    private void releaseTableIfNoActiveReservations(Long tableId, Long reservationId) {
        boolean hasActiveReservations = reservationRepository.findByTableId(tableId)
                .stream()
                .anyMatch(this::blocksTableSchedule);
        if (!hasActiveReservations) {
            updateTableStatus(tableId, "AVAILABLE", reservationId);
        }
    }

    private void updateTableStatus(Long tableId, String status, Long reservationId) {
        try {
            restaurantClient.updateTableStatus(tableId, status);
        } catch (Exception e) {
            log.warn("Failed to mark table {} as {} for reservation {}: {}",
                    tableId, status, reservationId, e.getMessage());
        }
    }

    private ReservationResponse toResponse(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getCustomerId(),
                r.getCustomerName(),
                r.getRestaurantId(),
                r.getRestaurantName(),
                r.getReservationDate(),
                r.getReservationTime(),
                r.getPartySize(),
                r.getStatus().name(),
                r.getNotes(),
                r.getOrderId(),
                r.getTableId(),
                r.getCheckedInAt(),
                r.getCreatedAt()
        );
    }

    private record OperatingWindow(LocalTime openTime, LocalTime closeTime) {}
    private record TableCandidate(Long id, Integer seats, String status) {}
}
