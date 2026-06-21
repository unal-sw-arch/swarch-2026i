package com.clickmunch.NotificationService.entity;

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
@Table("notifications")
public class Notification {
    @Id
    private Long id;
    private Long userId;
    private Long restaurantId;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean read;
    private Long orderId;
    private LocalDateTime createdAt;
}
