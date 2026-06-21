package com.clickmunch.OrderService.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        Long restaurantId,
        Long customerId,
        String customerName,
        Integer tableNumber,
        Long tableId,
        String status,
        String notes,
        BigDecimal totalAmount,
        Integer priority,
        LocalDateTime requestedArrivalTime,
        String arrivalMessage,
        String cancellationReason,
        LocalDateTime cancelledAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items
) {
}
