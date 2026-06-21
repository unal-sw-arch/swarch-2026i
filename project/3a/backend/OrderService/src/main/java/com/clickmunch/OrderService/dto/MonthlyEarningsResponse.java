package com.clickmunch.OrderService.dto;

import java.math.BigDecimal;

public record MonthlyEarningsResponse(
        Long restaurantId,
        Integer year,
        Integer month,
        BigDecimal grossEarnings,
        Long deliveredOrders,
        BigDecimal averageTicket
) {
}