package com.clickmunch.OrderService.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class RestaurantClient {

    private final RestClient restClient;

    public RestaurantClient(@Value("${services.restaurant.url:http://localhost:8082}") String url) {
        this.restClient = RestClient.builder().baseUrl(url).build();
    }

    public void updateTableStatus(Long tableId, String status) {
        restClient.put()
                .uri("/api/restaurants/tables/{tableId}/status?status={status}", tableId, status)
                .retrieve()
                .toBodilessEntity();
    }
}
