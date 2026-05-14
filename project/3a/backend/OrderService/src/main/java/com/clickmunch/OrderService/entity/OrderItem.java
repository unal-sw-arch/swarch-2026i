package com.clickmunch.OrderService.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Table("order_items")
public class OrderItem {
    @Id
    private Long id;
    private Long orderId;
    private String itemName;
    private String notes;
}
