package com.clickmunch.RestaurantService.entity;

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
@Table("staff_assignments")
public class StaffAssignment {
    @Id
    private Long id;
    private Long restaurantId;
    private Long userId;
    private String role; // WAITER, CHEF
    private Boolean active;
    private LocalDateTime assignedAt;
}
