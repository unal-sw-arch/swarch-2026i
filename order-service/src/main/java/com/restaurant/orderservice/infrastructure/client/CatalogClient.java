package com.restaurant.orderservice.infrastructure.client;

import com.restaurant.orderservice.infrastructure.client.dto.CatalogMenuItemDto;

import java.util.List;

/**
 * SUPUESTO DE INTEGRACIÓN
 * Contrato que este servicio necesita del Catalog Service.
 * La implementación concreta (HTTP) vive en CatalogServiceClient — Fase 5.
 * Si el Catalog Service cambia su API, solo se modifica la implementación.
 */
public interface CatalogClient {

    void validateRestaurantExists(Long restaurantId);

    CatalogMenuItemDto getMenuItem(Long menuItemId);

    List<CatalogMenuItemDto> getMenuItems(List<Long> menuItemIds);
}
