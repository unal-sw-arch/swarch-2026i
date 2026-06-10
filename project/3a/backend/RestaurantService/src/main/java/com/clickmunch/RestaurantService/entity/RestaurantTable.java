package com.clickmunch.RestaurantService.entity;

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
@Table("restaurant_tables")
public class RestaurantTable {
    @Id
    private Long id;
    private Long restaurantId;
    private String tableNumber;
    private Integer seats;
    private String status; // AVAILABLE, OCCUPIED, RESERVED
}
