package com.clickmunch.OrderService.repository;

import com.clickmunch.OrderService.entity.Order;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderRepository extends ListCrudRepository<Order, Long> {

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId ORDER BY created_at ASC")
    List<Order> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId AND status = :status ORDER BY created_at ASC")
    List<Order> findByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") String status);

    @Query("SELECT * FROM orders WHERE restaurant_id = :restaurantId AND status IN ('PENDING', 'IN_PREPARATION', 'READY') ORDER BY created_at ASC")
    List<Order> findActiveByRestaurantId(@Param("restaurantId") Long restaurantId);
}
