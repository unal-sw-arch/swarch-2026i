package com.clickmunch.ReservationService.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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

    private final ReservationRepository reservationRepository;
    private final RestaurantClient restaurantClient;
    private final ReservationEventPublisher eventPublisher;

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request) {
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

        Reservation saved = reservationRepository.save(reservation);
        return toResponse(saved);
    }

    @Transactional
    public ReservationResponse assignTable(Long id, Long tableId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
        reservation.setTableId(tableId);
        Reservation updated = reservationRepository.save(reservation);
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
                try {
                    restaurantClient.updateTableStatus(reservation.getTableId(), "AVAILABLE");
                } catch (Exception e) {
                    log.warn("Failed to release table {} for reservation {}: {}",
                            reservation.getTableId(), reservation.getId(), e.getMessage());
                }
            }

            log.info("Auto-released reservation {} (no check-in within 10 minutes)", reservation.getId());
        }
    }

    // ─── Suggested Available Times ───

    public SuggestedTimesResponse suggestAvailableTimes(Long restaurantId, LocalDate date, Integer partySize) {
        // Get all tables that can fit the party
        List<Map<String, Object>> allTables = restaurantClient.getAllTables(restaurantId);
        long totalSuitableTables = allTables.stream()
                .filter(t -> ((Number) t.get("seats")).intValue() >= partySize)
                .count();

        // Get existing reservations for this restaurant on this date (non-cancelled)
        List<Reservation> existingReservations = reservationRepository.findByRestaurantIdAndDate(restaurantId, date)
                .stream()
                .filter(r -> r.getStatus() != ReservationStatus.Cancelada && r.getStatus() != ReservationStatus.NoShow)
                .toList();

        // Get operating hours for the restaurant
        List<Map<String, Object>> operatingHours = restaurantClient.getOperatingHours(restaurantId);

        // Determine the day-of-week for the requested date
        String dayOfWeek = date.getDayOfWeek().name(); // e.g. MONDAY

        // Find the operating hours for that day
        LocalTime openTime = LocalTime.of(10, 0); // default
        LocalTime closeTime = LocalTime.of(22, 0); // default
        for (Map<String, Object> hours : operatingHours) {
            String day = (String) hours.get("dayOfWeek");
            if (day != null && day.equalsIgnoreCase(dayOfWeek)) {
                openTime = LocalTime.parse((String) hours.get("openTime"));
                closeTime = LocalTime.parse((String) hours.get("closeTime"));
                break;
            }
        }

        // Generate 30-minute time slots and count available tables for each
        // Assume each reservation occupies a table for 1.5 hours
        int reservationDurationMinutes = 90;
        List<SuggestedTimesResponse.TimeSlot> slots = new ArrayList<>();

        for (LocalTime slotTime = openTime; slotTime.plusMinutes(30).isBefore(closeTime) || slotTime.plusMinutes(30).equals(closeTime); slotTime = slotTime.plusMinutes(30)) {
            final LocalTime currentSlot = slotTime;
            // Count reservations that overlap with this slot
            long occupiedTables = existingReservations.stream()
                    .filter(r -> {
                        LocalTime resStart = r.getReservationTime();
                        LocalTime resEnd = resStart.plusMinutes(reservationDurationMinutes);
                        // Overlap: reservation covers [resStart, resEnd), slot covers [currentSlot, currentSlot+90min)
                        return currentSlot.isBefore(resEnd) && resStart.isBefore(currentSlot.plusMinutes(reservationDurationMinutes));
                    })
                    .count();

            int available = (int) (totalSuitableTables - occupiedTables);
            if (available > 0) {
                slots.add(new SuggestedTimesResponse.TimeSlot(currentSlot, available));
            }
        }

        return new SuggestedTimesResponse(restaurantId, date.toString(), partySize, slots);
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
}
