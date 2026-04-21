package com.restaurant.orderservice.infrastructure.client;

import com.restaurant.orderservice.infrastructure.client.dto.CatalogMenuItemDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Stub de CatalogClient activo mientras no exista una implementación real.
 * Fase 5 reemplaza este bean con CatalogServiceClient (HTTP real).
 * ConditionalOnMissingBean garantiza que Fase 5 lo desplace automáticamente.
 */
@Slf4j
@Component
@Profile("noop-catalog")
public class NoOpCatalogClient implements CatalogClient {

    @Override
    public void validateRestaurantExists(Long restaurantId) {
        log.warn("NoOpCatalogClient.validateRestaurantExists({}): stub — implementar en Fase 5", restaurantId);
        throw new UnsupportedOperationException("CatalogClient no implementado aún (Fase 5)");
    }

    @Override
    public CatalogMenuItemDto getMenuItem(Long menuItemId) {
        log.warn("NoOpCatalogClient.getMenuItem({}): stub — implementar en Fase 5", menuItemId);
        throw new UnsupportedOperationException("CatalogClient no implementado aún (Fase 5)");
    }

    @Override
    public List<CatalogMenuItemDto> getMenuItems(List<Long> menuItemIds) {
        log.warn("NoOpCatalogClient.getMenuItems({}): stub — implementar en Fase 5", menuItemIds);
        throw new UnsupportedOperationException("CatalogClient no implementado aún (Fase 5)");
    }
}
