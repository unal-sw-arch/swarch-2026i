package com.restaurant.orderservice.domain.repository;

import com.restaurant.orderservice.domain.model.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    // findById(Long id) → valida existencia del menú antes de consultar sus productos
    // Heredado de JpaRepository
}
