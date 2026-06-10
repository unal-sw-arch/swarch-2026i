package com.clickmunch.OrderService.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.OrderService.entity.WaiterCall;

public interface WaiterCallRepository extends ListCrudRepository<WaiterCall, Long> {

    @Query("SELECT * FROM waiter_calls WHERE restaurant_id = :restaurantId AND status = 'PENDING' ORDER BY created_at ASC")
    List<WaiterCall> findPendingByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM waiter_calls WHERE order_id = :orderId ORDER BY created_at DESC")
    List<WaiterCall> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT * FROM waiter_calls WHERE restaurant_id = :restaurantId ORDER BY created_at DESC")
    List<WaiterCall> findByRestaurantId(@Param("restaurantId") Long restaurantId);
}
