package com.restaurant.orderservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private Long restaurantId;
    private String customerName;
    private String customerPhone;
    private String status;
    private BigDecimal totalAmount;
    private String notes;
    private Instant createdAt;
    private List<OrderItemResponse> items;
}
