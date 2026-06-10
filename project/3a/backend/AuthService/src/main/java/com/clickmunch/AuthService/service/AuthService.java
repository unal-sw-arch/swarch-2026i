package com.clickmunch.AuthService.service;

import com.clickmunch.AuthService.config.JwtTokenUtil;
import com.clickmunch.AuthService.dto.*;
import com.clickmunch.AuthService.entity.ApprovalStatus;
import com.clickmunch.AuthService.entity.Role;
import com.clickmunch.AuthService.entity.User;
import com.clickmunch.AuthService.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

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
            return new ApiResponse<>("Username is already taken", null);
        }
        if (userRepository.existsByEmail(registerRequest.email())) {
            return new ApiResponse<>("Email is already in use", null);
        }

        // Asignar rol por defecto CUSTOMER si no se especifica o si viene vacío
        String userRole = (registerRequest.role() == null || registerRequest.role().trim().isEmpty()) 
            ? "CUSTOMER" 
            : registerRequest.role().toUpperCase();
        Role role = Role.valueOf(userRole);

        // WAITER and CHEF cannot self-register — they must use the staff invite flow
        if (role == Role.WAITER || role == Role.CHEF) {
            return new ApiResponse<>("Staff must register via invite link from a restaurant manager", null);
        }

        // CUSTOMER → auto-approved, RESTAURANT_MANAGER → pending admin approval
        ApprovalStatus approvalStatus = (role == Role.CUSTOMER || role == Role.ADMIN)
                ? ApprovalStatus.APPROVED
                : ApprovalStatus.PENDING_APPROVAL;

        User user = User.builder()
                .name(registerRequest.name())
                .email(registerRequest.email())
                .username(registerRequest.username())
                .passwordHash(passwordEncoder.encode(registerRequest.password()))
                .role(role)
                .approvalStatus(approvalStatus)
                .phone(registerRequest.phone())
                .address(registerRequest.address())
                .governmentId(registerRequest.governmentId())
                .profileImageUrl(registerRequest.profileImageUrl())
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        if (approvalStatus == ApprovalStatus.PENDING_APPROVAL) {
            return new ApiResponse<>("Registration submitted. Awaiting admin approval.", null);
        }
        return new ApiResponse<>("User registered successfully", null);
    }

    public ApiResponse<LoginResponse> login(LoginRequest loginRequest) {
        System.out.println("=== LOGIN METHOD CALLED ===");
        System.out.println("Username received: " + loginRequest.username());
        var userOpt = userRepository.findByUsername(loginRequest.username());
        if (userOpt.isEmpty()) {
            return new ApiResponse<>("Invalid username or password", null);
        }
        User user = userOpt.get();
        System.out.println("USER FOUND: " + user.toString());
        if (!passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            return new ApiResponse<>("Invalid username or password", null);
        }

        // Block login for users that are not approved
        if (user.getApprovalStatus() == ApprovalStatus.PENDING_APPROVAL) {
            return new ApiResponse<>("Your account is pending approval", null);
        }
        if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
            return new ApiResponse<>("Your account has been rejected", null);
        }

        String token = jwtTokenUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name(),user.getName());
        return new ApiResponse<>("Login successful", new LoginResponse(token));
    }

    // ─── Staff Invite Flow ───

    public ApiResponse<String> createStaffInvite(StaffInviteRequest request) {
        Role role = Role.valueOf(request.role().toUpperCase());
        if (role != Role.WAITER && role != Role.CHEF) {
            return new ApiResponse<>("Only WAITER or CHEF roles can be invited", null);
        }
        if (userRepository.existsByEmail(request.email())) {
            return new ApiResponse<>("Email is already in use", null);
        }

        String inviteToken = UUID.randomUUID().toString();

        // Create a placeholder user with the invite token (no password yet)
        User placeholder = User.builder()
                .name("Pending")
                .email(request.email())
                .username(request.email()) // temporary username
                .passwordHash("INVITE_PENDING")
                .role(role)
                .approvalStatus(ApprovalStatus.PENDING_APPROVAL)
                .inviteToken(inviteToken)
                .inviteTokenExpiry(LocalDateTime.now().plusDays(7))
                .invitedRestaurantId(request.restaurantId())
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(placeholder);
        return new ApiResponse<>("Staff invite created. Share this token with the staff member.", inviteToken);
    }

    public ApiResponse<String> completeStaffRegistration(StaffRegisterRequest request) {
        Optional<User> userOpt = userRepository.findByInviteToken(request.inviteToken());
        if (userOpt.isEmpty()) {
            return new ApiResponse<>("Invalid or expired invite token", null);
        }

        User user = userOpt.get();

        if (userRepository.existsByUsername(request.username())) {
            return new ApiResponse<>("Username is already taken", null);
        }

        user.setName(request.name());
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setGovernmentId(request.governmentId());
        user.setProfileImageUrl(request.profileImageUrl());
        user.setAddress(request.address());
        user.setPhone(request.phone());
        user.setInviteToken(null);
        user.setInviteTokenExpiry(null);
        // Staff remains PENDING_APPROVAL until restaurant manager or admin approves

        userRepository.save(user);
        return new ApiResponse<>("Staff registration completed. Awaiting approval.", null);
    }

    // ─── Admin Approval ───

    public UserInfoResponse approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setApprovalStatus(ApprovalStatus.APPROVED);
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public UserInfoResponse rejectUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.setApprovalStatus(ApprovalStatus.REJECTED);
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserInfoResponse> getPendingUsers() {
        return userRepository.findByApprovalStatus(ApprovalStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toResponse).toList();
    }

    // ─── Existing Methods ───

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
            return toResponse(user);
        }
    }

    public UserInfoResponse updateProfile(Long id, UpdateProfileRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.profileImageUrl() != null) user.setProfileImageUrl(request.profileImageUrl());
        if (request.address() != null) user.setAddress(request.address());
        if (request.governmentId() != null) user.setGovernmentId(request.governmentId());
        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    public List<UserInfoResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::toResponse).toList();
    }

    private UserInfoResponse toResponse(User user) {
        return new UserInfoResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getApprovalStatus() != null ? user.getApprovalStatus().name() : null,
                user.getPhone(),
                user.getBio(),
                user.getProfileImageUrl(),
                user.getAddress(),
                user.getGovernmentId()
        );
    }

}
