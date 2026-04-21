package com.clickmunch.OrderService.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Table("orders")
public class Order {
    @Id
    private Long id;
    private Long restaurantId;
    private Integer tableNumber;
    private OrderStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
