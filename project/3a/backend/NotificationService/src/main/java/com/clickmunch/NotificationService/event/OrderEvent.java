package com.clickmunch.NotificationService.event;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderEvent(
        String eventType,
        Long orderId,
        Long customerId,
        String customerName,
        Long restaurantId,
        String restaurantName,
        String status,
        String previousStatus,
        BigDecimal total,
        LocalDateTime timestamp
) implements Serializable {}
