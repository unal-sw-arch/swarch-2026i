package com.clickmunch.OrderService.repository;

import com.clickmunch.OrderService.entity.OrderItem;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OrderItemRepository extends ListCrudRepository<OrderItem, Long> {

    @Query("SELECT * FROM order_items WHERE order_id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT * FROM order_items WHERE order_id IN (:orderIds)")
    List<OrderItem> findByOrderIdIn(@Param("orderIds") List<Long> orderIds);
}
