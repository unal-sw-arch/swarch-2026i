package com.clickmunch.OrderService.dto;

public record OrderEtaResponse(
        Long orderId,
        Long restaurantId,
        String mode,
        Double etaMinutes
) {
}