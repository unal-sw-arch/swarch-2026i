package com.clickmunch.OrderService.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("waiter_calls")
public class WaiterCall {
    @Id
    private Long id;
    private Long orderId;
    private Long tableId;
    private Long restaurantId;
    private String status; // PENDING, ACKNOWLEDGED, RESOLVED
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
