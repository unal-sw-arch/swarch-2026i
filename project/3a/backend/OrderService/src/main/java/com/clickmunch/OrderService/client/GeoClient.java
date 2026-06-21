package com.clickmunch.OrderService.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GeoClient {
    private final RestClient restClient;

    public GeoClient(@Value("${geo.service.url}") String geoServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(geoServiceUrl)
                .build();
    }

    public Double getDistanceMeters(Long restaurantId, Double latitude, Double longitude) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/geo/distance")
                        .queryParam("restaurantId", restaurantId)
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .build())
                .retrieve()
                .body(Double.class);
    }
}