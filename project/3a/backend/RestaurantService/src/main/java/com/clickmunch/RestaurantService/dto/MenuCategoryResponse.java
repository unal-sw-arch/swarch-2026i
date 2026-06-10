package com.clickmunch.RestaurantService.dto;

import java.util.List;

public record MenuCategoryResponse(
        String id,
        String name,
        List<MenuItemResponse> menuItems
) {
}
