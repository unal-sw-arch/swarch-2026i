package com.restaurant.orderservice.application.mapper;

import com.restaurant.orderservice.application.dto.*;
import com.restaurant.orderservice.domain.model.Order;
import com.restaurant.orderservice.domain.model.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderResponse toOrderResponse(Order order) {
        return OrderResponse.builder()
            .id(order.getId())
            .customerId(order.getCustomerId())
            .restaurantId(order.getRestaurantId())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .createdAt(order.getCreatedAt())
            .items(toItemResponses(order.getItems()))
            .build();
    }

    public CustomerOrderSummary toCustomerSummary(Order order) {
        return CustomerOrderSummary.builder()
            .id(order.getId())
            .restaurantId(order.getRestaurantId())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .build();
    }

    public RestaurantOrderSummary toRestaurantSummary(Order order) {
        return RestaurantOrderSummary.builder()
            .id(order.getId())
            .customerId(order.getCustomerId())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .build();
    }

    private List<OrderItemResponse> toItemResponses(List<OrderItem> items) {
        return items.stream()
            .map(this::toItemResponse)
            .collect(Collectors.toList());
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
            .menuItemId(item.getMenuItemId())
            .productName(item.getProductNameSnapshot())
            .unitPrice(item.getUnitPriceSnapshot())
            .quantity(item.getQuantity())
            .subtotal(item.getSubtotal())
            .build();
    }
}
