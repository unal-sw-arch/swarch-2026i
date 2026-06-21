package com.clickmunch.OrderService.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record OrderPriorityRequest(
        @NotNull @Min(0) Integer priority
) {
}