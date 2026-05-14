package com.clickmunch.ReservationService.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Component
public class RestaurantClient {

    private final RestClient restClient;

    public RestaurantClient(@Value("${services.restaurant.url:http://localhost:8082}") String url) {
        this.restClient = RestClient.builder().baseUrl(url).build();
    }

    public List<Map<String, Object>> getAvailableTables(Long restaurantId, Integer partySize) {
        return restClient.get()
                .uri("/api/restaurants/{restaurantId}/tables/available?partySize={partySize}",
                        restaurantId, partySize)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<Map<String, Object>> getAllTables(Long restaurantId) {
        return restClient.get()
                .uri("/api/restaurants/{restaurantId}/tables", restaurantId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public Map<String, Object> getRestaurant(Long restaurantId) {
        return restClient.get()
                .uri("/api/restaurants/{id}", restaurantId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public List<Map<String, Object>> getOperatingHours(Long restaurantId) {
        return restClient.get()
                .uri("/api/restaurants/{restaurantId}/hours", restaurantId)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public void updateTableStatus(Long tableId, String status) {
        restClient.put()
                .uri("/api/restaurants/tables/{tableId}/status?status={status}", tableId, status)
                .retrieve()
                .toBodilessEntity();
    }
}
