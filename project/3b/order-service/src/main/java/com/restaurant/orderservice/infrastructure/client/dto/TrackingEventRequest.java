package com.restaurant.orderservice.infrastructure.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingEventRequest {

    private String eventType;
    private String entityType;
    private String entityId;
    private String restaurantId;
    private String orderId;
    private String timestamp;
    private String sourceService;
    private TrackingEventPayload payload;
}
