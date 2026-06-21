package com.clickmunch.RestaurantService.entity;

import java.time.LocalTime;

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
@Table("operating_hours")
public class OperatingHours {
    @Id
    private Long id;
    private Long restaurantId;
    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    private LocalTime openTime;
    private LocalTime closeTime;
}
