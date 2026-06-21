package com.clickmunch.AuthService.repository;

import com.clickmunch.AuthService.entity.User;
import com.clickmunch.AuthService.entity.Role;
import com.clickmunch.AuthService.entity.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    // Estos son los métodos que le faltaban al AuthService:
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.resetToken = :resetToken AND u.resetTokenExpiry > CURRENT_TIMESTAMP")
    Optional<User> findByResetToken(@Param("resetToken") String resetToken);

    // Cambiado para recibir el objeto ENUM directamente
    List<User> findByRole(Role role);

    @Query("SELECT u FROM User u WHERE u.inviteToken = :inviteToken AND u.inviteTokenExpiry > CURRENT_TIMESTAMP")
    Optional<User> findByInviteToken(@Param("inviteToken") String inviteToken);

    // Cambiado para recibir el objeto ENUM directamente
    List<User> findByApprovalStatus(ApprovalStatus approvalStatus);
}