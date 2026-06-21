package com.restaurant.orderservice.application.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "restaurantId es requerido")
    private Long restaurantId;

    // notes es opcional según el contrato
    private String notes;

    @NotEmpty(message = "El pedido debe tener al menos un item")
    @Valid
    private List<CreateOrderItemRequest> items;
}
