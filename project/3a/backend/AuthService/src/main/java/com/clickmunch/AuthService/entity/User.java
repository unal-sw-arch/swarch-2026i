package com.clickmunch.AuthService.entity;

import lombok.Builder;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@Table( name = "users")
public class User {
    @Id
    private Long id;
    private String name;
    private String email;
    private String username;
    private String passwordHash;
    private Role role;
    private LocalDateTime createdAt;

    private String resetToken;
    private LocalDateTime resetTokenExpiry;

}
