package com.clickmunch.MenuService.dto;

import java.math.BigDecimal;

public record MenuItemRequest(
    String name,
    String description,
    BigDecimal price,
    String imageUrl
) {
}