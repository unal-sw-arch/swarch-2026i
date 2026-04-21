package com.restaurant.orderservice.infrastructure.client;

import com.restaurant.orderservice.domain.exception.MenuItemNotFoundException;
import com.restaurant.orderservice.domain.exception.RestaurantNotFoundException;
import com.restaurant.orderservice.infrastructure.client.dto.CatalogMenuItemDto;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Stub de catálogo para el perfil local.
 * Datos fijos que coinciden con la colección Postman de pruebas.
 * Reemplazado automáticamente por CatalogServiceClient en perfiles no-local.
 */
@Component
@Profile("local")
public class LocalCatalogClient implements CatalogClient {

    private static final Map<Long, CatalogMenuItemDto> ITEMS = Map.of(
        101L, new CatalogMenuItemDto(101L, 10L, "Bandeja Paisa", new BigDecimal("30000.00"), true),
        102L, new CatalogMenuItemDto(102L, 10L, "Ajiaco",        new BigDecimal("22000.00"), true),
        201L, new CatalogMenuItemDto(201L, 10L, "Item Agotado",  new BigDecimal("15000.00"), false)
    );

    private static final java.util.Set<Long> KNOWN_RESTAURANTS = java.util.Set.of(10L);

    @Override
    public void validateRestaurantExists(Long restaurantId) {
        if (!KNOWN_RESTAURANTS.contains(restaurantId)) {
            throw new RestaurantNotFoundException(restaurantId);
        }
    }

    @Override
    public CatalogMenuItemDto getMenuItem(Long menuItemId) {
        CatalogMenuItemDto item = ITEMS.get(menuItemId);
        if (item == null) throw new MenuItemNotFoundException(menuItemId);
        return item;
    }

    @Override
    public List<CatalogMenuItemDto> getMenuItems(List<Long> menuItemIds) {
        return menuItemIds.stream()
            .map(id -> {
                CatalogMenuItemDto item = ITEMS.get(id);
                if (item == null) throw new MenuItemNotFoundException(id);
                return item;
            })
            .collect(Collectors.toList());
    }
}
