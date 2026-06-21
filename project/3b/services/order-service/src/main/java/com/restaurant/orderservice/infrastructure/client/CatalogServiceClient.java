package com.restaurant.orderservice.infrastructure.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.restaurant.orderservice.domain.exception.MenuItemNotFoundException;
import com.restaurant.orderservice.domain.exception.RestaurantNotFoundException;
import com.restaurant.orderservice.infrastructure.client.dto.CatalogMenuItemDto;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
@Profile("!local")
@RequiredArgsConstructor
public class CatalogServiceClient implements CatalogClient {

    private final RestTemplate restTemplate;

    @Value("${catalog.service.url}")
    private String catalogBaseUrl;

    @Override
    public void validateRestaurantExists(Long restaurantId) {
        RestaurantsResponse restaurants = fetchRestaurants();
        boolean exists = restaurants.getItems() != null
            && restaurants.getItems().stream().anyMatch(r -> restaurantId.equals(r.getId()));
        if (!exists) {
            throw new RestaurantNotFoundException(restaurantId);
        }
    }

    @Override
    public CatalogMenuItemDto getMenuItem(Long menuItemId) {
        return getMenuItems(List.of(menuItemId)).get(0);
    }

    @Override
    public List<CatalogMenuItemDto> getMenuItems(List<Long> menuItemIds) {
        Set<Long> requested = Set.copyOf(menuItemIds);
        Map<Long, CatalogMenuItemDto> found = new LinkedHashMap<>();

        RestaurantsResponse restaurants = fetchRestaurants();
        List<RestaurantDto> restaurantItems = restaurants.getItems() == null ? List.of() : restaurants.getItems();

        for (RestaurantDto restaurant : restaurantItems) {
            MenuResponse menu = fetchMenuByRestaurantId(restaurant.getId());
            if (menu.getItems() == null) {
                continue;
            }
            for (MenuItemDto item : menu.getItems()) {
                if (requested.contains(item.getId())) {
                    found.put(item.getId(), new CatalogMenuItemDto(
                        item.getId(),
                        menu.getRestaurantId(),
                        item.getName(),
                        item.getPrice(),
                        item.isAvailable()
                    ));
                }
            }
        }

        List<Long> missing = requested.stream()
            .filter(id -> !found.containsKey(id))
            .toList();
        if (!missing.isEmpty()) {
            throw new MenuItemNotFoundException(missing.get(0));
        }

        List<CatalogMenuItemDto> ordered = new ArrayList<>();
        for (Long id : menuItemIds) {
            ordered.add(found.get(id));
        }
        return ordered;
    }

    private RestaurantsResponse fetchRestaurants() {
        try {
            RestaurantsResponse response = restTemplate.getForObject(
                catalogBaseUrl + "/restaurants",
                RestaurantsResponse.class
            );
            return response == null ? new RestaurantsResponse() : response;
        } catch (RestClientException ex) {
            throw new IllegalStateException("Unable to query catalog service restaurants", ex);
        }
    }

    private MenuResponse fetchMenuByRestaurantId(Long restaurantId) {
        try {
            MenuResponse response = restTemplate.getForObject(
                catalogBaseUrl + "/restaurants/{id}/menu",
                MenuResponse.class,
                restaurantId
            );
            return response == null ? new MenuResponse() : response;
        } catch (RestClientException ex) {
            throw new IllegalStateException("Unable to query catalog menu for restaurant " + restaurantId, ex);
        }
    }

    @Data
    public static class RestaurantsResponse {
        private List<RestaurantDto> items = List.of();
    }

    @Data
    public static class RestaurantDto {
        private Long id;
        private String name;
    }

    @Data
    public static class MenuResponse {
        private Long restaurantId;
        private List<MenuItemDto> items = List.of();
    }

    @Data
    public static class MenuItemDto {
        private Long id;
        private String name;
        private BigDecimal price;
        @JsonProperty("isAvailable")
        private boolean available;
    }
}
