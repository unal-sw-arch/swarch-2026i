package com.clickmunch.RestaurantService.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import lombok.Data;

@Data
@Table("restaurant_profiles")
public class RestaurantProfile {
    @Id
    private Long restaurantId;
    private String category;
    private String city;
    private String avgPrice;
    private String deliveryTime;
    private String badge;
    private Double rating;
    private Double latitude;
    private Double longitude;
}

