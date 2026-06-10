package com.clickmunch.AuthService.controller;
import com.clickmunch.AuthService.entity.Role;
import com.clickmunch.AuthService.dto.*;
import com.clickmunch.AuthService.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest loginRequest) {
        ApiResponse<LoginResponse> response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody RegisterRequest registerRequest) {
        ApiResponse<String> response = authService.register(registerRequest);
        return ResponseEntity.ok(response);
    }

    // ─── Staff Invite Flow ───

    @PostMapping("/staff-invite")
    public ResponseEntity<ApiResponse<String>> createStaffInvite(
            @Valid @RequestBody StaffInviteRequest request) {
        return ResponseEntity.ok(authService.createStaffInvite(request));
    }

    @PostMapping("/register/staff")
    public ResponseEntity<ApiResponse<String>> registerStaff(
            @Valid @RequestBody StaffRegisterRequest request) {
        return ResponseEntity.ok(authService.completeStaffRegistration(request));
    }

    // ─── Admin Approval ───

    @PutMapping("/users/{userId}/approve")
    public ResponseEntity<UserInfoResponse> approveUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.approveUser(userId));
    }

    @PutMapping("/users/{userId}/reject")
    public ResponseEntity<UserInfoResponse> rejectUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authService.rejectUser(userId));
    }

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserInfoResponse>> getPendingUsers() {
        return ResponseEntity.ok(authService.getPendingUsers());
    }

    // ─── User Info ───

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserInfoResponse> getUserInfo(@PathVariable Long userId) {
        UserInfoResponse response = authService.getUserById(userId);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/{userId}/profile")
    public ResponseEntity<UserInfoResponse> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(userId, request));
    }

    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserInfoResponse>> getUsersByRole(@PathVariable Role role) {
        return ResponseEntity.ok(authService.getUsersByRole(role));
    }
}