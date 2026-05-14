package com.clickmunch.RatingService.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("waiter_ratings")
public class WaiterRating {
    @Id
    private Long id;
    private Long customerId;
    private String customerName;
    private Long waiterId;
    private String waiterName;
    private Long restaurantId;
    private Long orderId;
    private Integer score;
    private String comment;
    private LocalDateTime createdAt;
}
