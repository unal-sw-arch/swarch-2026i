package com.clickmunch.AuthService.service;

import com.clickmunch.AuthService.config.JwtTokenUtil;
import com.clickmunch.AuthService.dto.ApiResponse;
import com.clickmunch.AuthService.dto.LoginRequest;
import com.clickmunch.AuthService.dto.RegisterRequest;
import com.clickmunch.AuthService.dto.UserInfoResponse;
import com.clickmunch.AuthService.entity.Role;
import com.clickmunch.AuthService.entity.User;
import com.clickmunch.AuthService.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public ApiResponse<String> register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.username())) {
            return new ApiResponse<>( "Username is already taken", null);
        }
        if (userRepository.existsByEmail(registerRequest.email())) {
            return new ApiResponse<>( "Email is already in use", null);
        }

        User user = User.builder()
                .name(registerRequest.name())
                .email(registerRequest.email())
                .username(registerRequest.username())
                .passwordHash(passwordEncoder.encode(registerRequest.password()))
                .role(Role.valueOf(registerRequest.role().toUpperCase()))
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        return new ApiResponse<>("User registered successfully", null);
    }

    public ApiResponse<String> login(LoginRequest loginRequest) {
        var userOpt = userRepository.findByUsername(loginRequest.username());
        if (userOpt.isEmpty()) {
            return new ApiResponse<>( "Invalid username or password", null);
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            return new ApiResponse<>( "Invalid username or password", null);
        }

        String token = jwtTokenUtil.generateToken(user.getUsername(), user.getRole().name());
        return new ApiResponse<>("Login successful", token);
    }

    public Optional<String> passwordReset(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();
        String resetToken = jwtTokenUtil.generateResetToken(user.getUsername());
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        return Optional.of(resetToken);
    }

    public boolean confirmPasswordReset(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepository.findByResetToken(resetToken);
        if (userOpt.isEmpty()) return false;

        User user = userOpt.get();
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) return false;
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return true;
    }

    public UserInfoResponse getUserById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return null;
        }
        else{
            User user = userOpt.get();
            return new UserInfoResponse(
                    user.getUsername(),
                    user.getRole().name()
            );
        }
    }

}
