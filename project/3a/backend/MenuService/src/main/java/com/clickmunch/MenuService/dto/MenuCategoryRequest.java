package com.clickmunch.MenuService.dto;

import com.clickmunch.MenuService.entity.Category;

public record MenuCategoryRequest(
    Long restaurantId,
    Category category
) {
}