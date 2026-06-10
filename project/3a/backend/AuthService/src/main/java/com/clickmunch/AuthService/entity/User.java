package com.clickmunch.AuthService.entity;

import jakarta.persistence.*; // IMPORTANTE: Usar Jakarta para JPA
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String username;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    private LocalDateTime createdAt;

    private String phone;
    private String bio;
    private String profileImageUrl;
    private String address;
    private String governmentId;

    private String inviteToken;
    private LocalDateTime inviteTokenExpiry;
    private Long invitedRestaurantId;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}