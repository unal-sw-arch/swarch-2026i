package com.clickmunch.AuthService.controller;


import com.clickmunch.AuthService.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth/password-reset")
public class PasswordResetController {

    private final AuthService authService;

    public PasswordResetController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        var TokenResponse = authService.passwordReset(email);
        return TokenResponse.<ResponseEntity<?>>map(s -> ResponseEntity.ok(Map.of("message", s))).orElseGet(() -> ResponseEntity.badRequest().body(Map.of("error", "Email not found")));
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPasswordReset(@RequestBody Map<String, String> body) {
        String resetToken = body.get("resetToken");
        String newPassword = body.get("newPassword");
        boolean result = authService.confirmPasswordReset(resetToken, newPassword);
        if (result) {
            return ResponseEntity.ok(Map.of("message", "Password has been reset successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired reset token"));
        }
    }

}
