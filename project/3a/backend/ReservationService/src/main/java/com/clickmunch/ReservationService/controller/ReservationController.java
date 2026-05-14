package com.clickmunch.ReservationService.controller;

import com.clickmunch.ReservationService.dto.*;
import com.clickmunch.ReservationService.service.ReservationService;import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> create(@Valid @RequestBody CreateReservationRequest request) {
        ReservationResponse response = reservationService.createReservation(request);
        return ResponseEntity.created(URI.create("/api/reservations/" + response.id())).body(response);
    }

    @PutMapping("/{id}/assign-table")
    public ResponseEntity<ReservationResponse> assignTable(
            @PathVariable Long id,
            @RequestParam Long tableId) {
        return ResponseEntity.ok(reservationService.assignTable(id, tableId));
    }

    @GetMapping("/restaurant/{restaurantId}/available-tables")
    public ResponseEntity<List<Map<String, Object>>> getAvailableTables(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "1") Integer partySize) {
        return ResponseEntity.ok(reservationService.getAvailableTables(restaurantId, partySize));
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAll() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReservationResponse>> getByRestaurant(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reservationService.getReservationsByRestaurant(restaurantId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReservationResponse>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(reservationService.getReservationsByCustomer(customerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReservationResponse>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reservationService.getReservationsByStatus(status));
    }

    @GetMapping("/restaurant/{restaurantId}/date/{date}")
    public ResponseEntity<List<ReservationResponse>> getByRestaurantAndDate(
            @PathVariable Long restaurantId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getReservationsByRestaurantAndDate(restaurantId, date));
    }

    @GetMapping("/restaurant/{restaurantId}/suggested-times")
    public ResponseEntity<SuggestedTimesResponse> getSuggestedTimes(
            @PathVariable Long restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") Integer partySize) {
        return ResponseEntity.ok(reservationService.suggestAvailableTimes(restaurantId, date, partySize));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReservationStatusRequest request) {
        return ResponseEntity.ok(reservationService.updateStatus(id, request));
    }

    @PutMapping("/{id}/link-order")
    public ResponseEntity<ReservationResponse> linkOrder(
            @PathVariable Long id,
            @Valid @RequestBody LinkOrderRequest request) {
        return ResponseEntity.ok(reservationService.linkOrder(id, request));
    }

    @PutMapping("/{id}/check-in")
    public ResponseEntity<ReservationResponse> checkIn(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.checkIn(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
