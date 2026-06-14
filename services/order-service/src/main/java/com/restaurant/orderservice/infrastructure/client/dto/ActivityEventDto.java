package com.restaurant.orderservice.infrastructure.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityEventDto {
    private String eventType;
    private String entityType;
    private String entityId;
    private Long restaurantId;
    private String orderId;
    private String timestamp;
    private String sourceService;
    private Map<String, Object> payload;
}
