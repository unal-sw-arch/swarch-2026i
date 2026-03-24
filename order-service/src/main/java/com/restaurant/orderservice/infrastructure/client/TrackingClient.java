package com.restaurant.orderservice.infrastructure.client;

import com.restaurant.orderservice.infrastructure.client.dto.TrackingEventPayload;
import com.restaurant.orderservice.infrastructure.client.dto.TrackingEventRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Slf4j
@Component
@RequiredArgsConstructor
public class TrackingClient {

    private final RestTemplate restTemplate;

    @Value("${tracking.service.url}")
    private String trackingServiceUrl;

    // Fire-and-forget: si falla, se loggea y el pedido ya fue persistido
    public void notifyOrderCreated(Long orderId,
                                   Long restaurantId,
                                   String customerName,
                                   BigDecimal totalAmount,
                                   String status,
                                   LocalDateTime createdAt) {
        try {
            TrackingEventRequest event = buildEvent(
                    orderId, restaurantId, customerName, totalAmount, status, createdAt
            );

            String url = trackingServiceUrl + "/activities";

            log.info("Enviando evento ORDER_CREATED a tracking-service. orderId={} url={}",
                    orderId, url);

            ResponseEntity<Void> response = restTemplate.postForEntity(url, event, Void.class);

            log.info("Evento ORDER_CREATED enviado. orderId={} httpStatus={}",
                    orderId, response.getStatusCode());

        } catch (Exception ex) {
            log.error("Fallo al notificar tracking-service. orderId={} error={}",
                    orderId, ex.getMessage());
            // No se relanza: el pedido ya fue creado exitosamente
        }
    }

    private TrackingEventRequest buildEvent(Long orderId,
                                            Long restaurantId,
                                            String customerName,
                                            BigDecimal totalAmount,
                                            String status,
                                            LocalDateTime createdAt) {
        // Convierte LocalDateTime a ISO-8601 UTC con sufijo Z
        String timestamp = createdAt.toInstant(ZoneOffset.UTC).toString();

        TrackingEventPayload payload = TrackingEventPayload.builder()
                .customerName(customerName)
                .totalAmount(totalAmount)
                .status(status)
                .build();

        return TrackingEventRequest.builder()
                .eventType("ORDER_CREATED")
                .entityType("ORDER")
                .entityId(String.valueOf(orderId))
                .restaurantId(String.valueOf(restaurantId))
                .orderId(String.valueOf(orderId))
                .timestamp(timestamp)
                .sourceService("order-service")
                .payload(payload)
                .build();
    }
}
