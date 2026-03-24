package com.restaurant.orderservice.application.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CreateOrderItemRequest {

    @NotNull(message = "menuItemId es requerido")
    private Long menuItemId;

    @NotNull(message = "quantity es requerido")
    @Min(value = 1, message = "quantity debe ser mayor a cero")
    private Integer quantity;
}
