package com.clickmunch.ReservationService.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clickmunch.ReservationService.client.RestaurantClient;
import com.clickmunch.ReservationService.dto.CreateReservationRequest;
import com.clickmunch.ReservationService.dto.LinkOrderRequest;
import com.clickmunch.ReservationService.dto.ReservationResponse;
import com.clickmunch.ReservationService.dto.UpdateReservationStatusRequest;
import com.clickmunch.ReservationService.entity.Reservation;
import com.clickmunch.ReservationService.entity.ReservationStatus;
import com.clickmunch.ReservationService.event.ReservationEventPublisher;
import com.clickmunch.ReservationService.repository.ReservationRepository;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private RestaurantClient restaurantClient;

    @Mock
    private ReservationEventPublisher eventPublisher;

    @InjectMocks
    private ReservationService reservationService;

    private Reservation buildReservation() {
        return Reservation.builder()
                .id(1L)
                .customerId(10L)
                .customerName("John Doe")
                .restaurantId(5L)
                .restaurantName("La Parrilla")
                .reservationDate(LocalDate.of(2025, 7, 20))
                .reservationTime(LocalTime.of(19, 30))
                .partySize(4)
                .status(ReservationStatus.Pendiente)
                .notes("Window seat please")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createReservation_shouldReturnResponse() {
        CreateReservationRequest request = new CreateReservationRequest(
                10L, "John Doe", 5L, "La Parrilla",
                LocalDate.of(2025, 7, 20), LocalTime.of(19, 30),
                4, "Window seat please");

        Reservation saved = buildReservation();
        when(reservationRepository.save(any(Reservation.class))).thenReturn(saved);

        ReservationResponse response = reservationService.createReservation(request);

        assertEquals(1L, response.id());
        assertEquals("Pendiente", response.status());
        assertEquals(4, response.partySize());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void getReservationById_shouldReturnResponse() {
        Reservation reservation = buildReservation();
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        ReservationResponse response = reservationService.getReservationById(1L);

        assertEquals(1L, response.id());
        assertEquals("John Doe", response.customerName());
    }

    @Test
    void getReservationById_notFound_shouldThrow() {
        when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.getReservationById(99L));
    }

    @Test
    void getReservationsByRestaurant_shouldReturnList() {
        when(reservationRepository.findByRestaurantId(5L))
                .thenReturn(List.of(buildReservation()));

        List<ReservationResponse> responses = reservationService.getReservationsByRestaurant(5L);

        assertEquals(1, responses.size());
        assertEquals("La Parrilla", responses.get(0).restaurantName());
    }

    @Test
    void updateStatus_shouldChangeStatus() {
        Reservation reservation = buildReservation();
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateReservationStatusRequest request = new UpdateReservationStatusRequest("Confirmada");
        ReservationResponse response = reservationService.updateStatus(1L, request);

        assertNotNull(response);
        assertEquals("Confirmada", response.status());
        verify(reservationRepository).save(any(Reservation.class));
        verify(eventPublisher).publishReservationConfirmed(any());
    }

    @Test
    void linkOrder_shouldSetOrderId() {
        Reservation reservation = buildReservation();
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));

        Reservation linked = buildReservation();
        linked.setOrderId(42L);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(linked);

        LinkOrderRequest request = new LinkOrderRequest(42L);
        ReservationResponse response = reservationService.linkOrder(1L, request);

        assertEquals(42L, response.orderId());
        verify(reservationRepository).save(any(Reservation.class));
    }

    @Test
    void deleteReservation_shouldSucceed() {
        when(reservationRepository.existsById(1L)).thenReturn(true);

        reservationService.deleteReservation(1L);

        verify(reservationRepository).deleteById(1L);
    }

    @Test
    void deleteReservation_notFound_shouldThrow() {
        when(reservationRepository.existsById(99L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class,
                () -> reservationService.deleteReservation(99L));
    }
}
