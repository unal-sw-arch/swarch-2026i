package com.clickmunch.OrderService.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * One ordered unit. To order 2 burgers with different instructions, send 2
 * entries: one with notes="sin lechuga" and one with notes="con todo".
 * The frontend groups visually by (itemName, notes).
 */
public record CreateOrderItemRequest(
        @NotBlank String itemName,
        String notes
) {
}
