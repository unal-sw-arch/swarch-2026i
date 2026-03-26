package com.clickmunch.MenuService.dto;

import com.clickmunch.MenuService.entity.Category;

import java.math.BigDecimal;
import java.util.List;

public record MenuCreateRequest(
    Long restaurantId,
    List<CategoryRequest> categories
) {
    public record CategoryRequest(
        Category category,
        List<ItemRequest> items
    ) {}

    public record ItemRequest(
        String name,
        String description,
        BigDecimal price,
        String imageUrl
    ) {}
}