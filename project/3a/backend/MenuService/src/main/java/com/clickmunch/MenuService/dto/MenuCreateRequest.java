package com.clickmunch.MenuService.dto;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

import com.clickmunch.MenuService.entity.Category;

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
        String imageUrl,
        LocalTime availableFrom,
        LocalTime availableTo,
        Integer preparationMinutes
    ) {}
}