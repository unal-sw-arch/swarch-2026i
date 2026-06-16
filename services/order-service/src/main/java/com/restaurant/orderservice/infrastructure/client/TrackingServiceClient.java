package com.restaurant.orderservice.infrastructure.client;

import com.restaurant.orderservice.infrastructure.client.dto.ActivityEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrackingServiceClient {

    private final RestTemplate restTemplate;

    @Value("${tracking.service.url}")
    private String trackingBaseUrl;

    public void publishActivityEvent(ActivityEventDto event) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String jsonPayload = mapper.writeValueAsString(event);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(jsonPayload, headers);
            
            restTemplate.postForObject(trackingBaseUrl + "/activities", request, String.class);
            log.info("Published activity event to tracking service: {}", event.getEventType());
        } catch (Exception ex) {
            log.error("Failed to publish activity event to tracking service", ex);
        }
    }
}
