package com.restaurant.orderservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// Shape exacto del contrato: GET /restaurants/me/orders items[]
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantOrderSummary {

    private Long id;
    private Long customerId;
    private String status;
    private BigDecimal totalAmount;
}
