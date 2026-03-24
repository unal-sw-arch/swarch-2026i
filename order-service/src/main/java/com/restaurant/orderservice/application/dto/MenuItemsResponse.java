package com.restaurant.orderservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemsResponse {

    private Long menuId;
    private Long restaurantId;
    private List<MenuItemResponse> items;
}
