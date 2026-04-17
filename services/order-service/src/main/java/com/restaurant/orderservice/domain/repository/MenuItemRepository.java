package com.restaurant.orderservice.domain.repository;

import com.restaurant.orderservice.domain.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // Devuelve todos los productos de un menú — soporta GET /menus/{menuId}/items
    List<MenuItem> findAllByMenu_Id(Long menuId);

    // Devuelve los productos cuyos IDs están en la lista — soporta validación en POST /orders
    List<MenuItem> findAllByIdIn(List<Long> ids);
}
