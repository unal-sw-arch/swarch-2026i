package com.restaurant.orderservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

// Wrapper genérico: { "items": [...] }
@Getter
@AllArgsConstructor
public class OrderListResponse<T> {
    private List<T> items;
}
