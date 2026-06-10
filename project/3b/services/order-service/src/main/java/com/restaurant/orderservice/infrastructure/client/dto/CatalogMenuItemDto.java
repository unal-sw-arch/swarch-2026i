package com.restaurant.orderservice.infrastructure.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// DTO que modela la respuesta del Catalog Service para un menu item.
// SUPUESTO DE INTEGRACIÓN: endpoint interno GET /internal/menu-items/{id}
// aún no definido formalmente — aislado aquí para cambio mínimo cuando se acuerde.
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CatalogMenuItemDto {

    private Long id;
    private Long restaurantId;
    private String name;
    private BigDecimal price;
    private boolean available;
}
