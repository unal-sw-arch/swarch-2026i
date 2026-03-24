package com.restaurant.orderservice.domain.repository;

import com.restaurant.orderservice.domain.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    // findById(Long id)   → valida existencia antes de crear pedido
    // existsById(Long id) → alternativa ligera sin cargar la entidad
    // Ambos heredados de JpaRepository
}
