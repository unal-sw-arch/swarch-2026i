package com.restaurant.orderservice.domain.repository;

import com.restaurant.orderservice.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    // JOIN FETCH para evitar N+1 al cargar items del pedido
    @Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // Para GET /customers/me/orders — lista liviana, sin JOIN FETCH (items no se usan)
    List<Order> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Para GET /restaurants/me/orders — lista liviana, sin JOIN FETCH
    List<Order> findAllByRestaurantIdOrderByCreatedAtDesc(Long restaurantId);
}
