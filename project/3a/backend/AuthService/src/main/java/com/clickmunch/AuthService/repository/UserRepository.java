package com.clickmunch.AuthService.repository;

import com.clickmunch.AuthService.entity.User;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends ListCrudRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT * FROM users WHERE reset_token = :resetToken AND reset_token_expiry > NOW()")
    Optional<User> findByResetToken(@Param("resetToken") String resetToken);

    Optional<User> findByEmail(String email);

}
