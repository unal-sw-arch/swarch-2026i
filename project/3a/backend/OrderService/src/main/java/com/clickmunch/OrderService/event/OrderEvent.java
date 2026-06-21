package com.clickmunch.OrderService.event;

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
) implements Serializable {

    public static OrderEvent created(Long orderId, Long customerId, String customerName,
                                     Long restaurantId, String restaurantName,
                                     BigDecimal total) {
        return new OrderEvent("ORDER_CREATED", orderId, customerId, customerName,
                restaurantId, restaurantName, "Preparing", null, total, LocalDateTime.now());
    }

    public static OrderEvent statusChanged(Long orderId, Long customerId, String customerName,
                                           Long restaurantId, String restaurantName,
                                           String newStatus, String previousStatus,
                                           BigDecimal total) {
        return new OrderEvent("ORDER_STATUS_CHANGED", orderId, customerId, customerName,
                restaurantId, restaurantName, newStatus, previousStatus, total, LocalDateTime.now());
    }
}
