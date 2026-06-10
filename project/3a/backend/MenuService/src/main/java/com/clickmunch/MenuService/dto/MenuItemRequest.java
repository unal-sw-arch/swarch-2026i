package com.clickmunch.MenuService.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public record MenuItemRequest(
    String name,
    String description,
    BigDecimal price,
    String imageUrl,
    LocalTime availableFrom,
    LocalTime availableTo,
    Integer preparationMinutes
) {
}