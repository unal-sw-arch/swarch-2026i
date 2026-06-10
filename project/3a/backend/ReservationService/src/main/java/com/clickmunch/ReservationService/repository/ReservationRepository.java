package com.clickmunch.ReservationService.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.ReservationService.entity.Reservation;

public interface ReservationRepository extends ListCrudRepository<Reservation, Long> {

    @Query("SELECT * FROM reservations WHERE restaurant_id = :restaurantId ORDER BY reservation_date DESC, reservation_time DESC")
    List<Reservation> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM reservations WHERE customer_id = :customerId ORDER BY reservation_date DESC, reservation_time DESC")
    List<Reservation> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT * FROM reservations WHERE status = :status ORDER BY reservation_date DESC, reservation_time DESC")
    List<Reservation> findByStatus(@Param("status") String status);

    @Query("SELECT * FROM reservations WHERE restaurant_id = :restaurantId AND reservation_date = :date ORDER BY reservation_time")
    List<Reservation> findByRestaurantIdAndDate(@Param("restaurantId") Long restaurantId, @Param("date") LocalDate date);

    @Query("SELECT * FROM reservations WHERE restaurant_id = :restaurantId AND status = :status ORDER BY reservation_date DESC")
    List<Reservation> findByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") String status);

    @Query("SELECT * FROM reservations ORDER BY reservation_date DESC, reservation_time DESC")
    List<Reservation> findAllOrderedByDate();

    @Query("SELECT * FROM reservations WHERE status = 'Confirmada' AND reservation_date = CURRENT_DATE AND (reservation_time + INTERVAL '10 minutes') < CURRENT_TIME")
    List<Reservation> findOverdueConfirmedReservations();
}
