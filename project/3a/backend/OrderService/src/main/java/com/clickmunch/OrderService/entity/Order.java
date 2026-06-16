package com.clickmunch.OrderService.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Data;

@Data
@Table("orders")
public class Order {
    @Id
    private Long id;
    private Long restaurantId;
    private Long customerId;
    private String customerName;
    private Integer tableNumber;
    private Long tableId;
    private OrderStatus status;
    private String notes;
    private BigDecimal totalAmount;
    private Integer priority;
    private LocalDateTime requestedArrivalTime;
    private String arrivalMessage;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
