package com.clickmunch.OrderService.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.OrderService.entity.Order;

public interface OrderRepository extends ListCrudRepository<Order, Long> {

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId ORDER BY priority DESC, created_at ASC")
    List<Order> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId AND status = :status ORDER BY priority DESC, created_at ASC")
    List<Order> findByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") String status);

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId AND status IN ('PENDING', 'IN_PREPARATION', 'READY') ORDER BY priority DESC, created_at ASC")
    List<Order> findActiveByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(*) FROM orders WHERE table_id = :tableId AND status IN ('PENDING', 'IN_PREPARATION', 'READY')")
    int countActiveByTableId(@Param("tableId") Long tableId);

    @Query("SELECT * FROM orders WHERE customer_id = :customerId ORDER BY created_at DESC")
    List<Order> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId AND status = 'DELIVERED' AND created_at >= :start AND created_at < :end ORDER BY created_at ASC")
    List<Order> findDeliveredByRestaurantIdBetween(
            @Param("restaurantId") Long restaurantId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT oi.item_name FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.restaurant_id = :restaurantId AND o.status = 'DELIVERED' GROUP BY oi.item_name ORDER BY COUNT(*) DESC LIMIT 1")
    String findTopDeliveredDishByRestaurantId(@Param("restaurantId") Long restaurantId);
}
