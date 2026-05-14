package com.clickmunch.OrderService.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TipRequest(
        @NotNull @Positive BigDecimal tipAmount,
        String waiterComment
) {}
