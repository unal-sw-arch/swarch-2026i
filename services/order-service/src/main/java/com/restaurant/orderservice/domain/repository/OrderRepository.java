package com.restaurant.orderservice.domain.repository;

import com.restaurant.orderservice.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // Carga el pedido junto con sus items en una sola query — evita N+1 en GET /orders/{id}
    // JOIN FETCH necesario porque Order.items es LAZY
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);
}
