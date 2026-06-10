package com.clickmunch.AuthService.service;

import com.clickmunch.AuthService.config.JwtTokenUtil;
import com.clickmunch.AuthService.entity.Role;
import com.clickmunch.AuthService.entity.User;
import com.clickmunch.AuthService.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class UserServiceTest {

    @Test
    public void passwordReset_existingUser_generatesToken() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        JwtTokenUtil jwt = Mockito.mock(JwtTokenUtil.class);
        AuthService service = new AuthService(userRepository, encoder, jwt);

        User user = User.builder()
                .id(1L)
                .email("mockito@test.com")
                .username("mockito")
                .role(Role.CUSTOMER)
                .passwordHash(encoder.encode("123456"))
                .build();

        Mockito.when(userRepository.findByEmail("mockito@test.com"))
                .thenReturn(Optional.of(user));
        Mockito.when(jwt.generateResetToken("mockito")).thenReturn("reset-token");

        Optional<String> token = service.passwordReset("mockito@test.com");

        assertTrue(token.isPresent());
        Mockito.verify(userRepository).save(Mockito.argThat(u -> "reset-token".equals(u.getResetToken())));
    }

    @Test
    public void passwordReset_unknownUser_returnsEmpty() {
        UserRepository userRepository = Mockito.mock(UserRepository.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        JwtTokenUtil jwt = Mockito.mock(JwtTokenUtil.class);
        AuthService service = new AuthService(userRepository, encoder, jwt);

        Mockito.when(userRepository.findByEmail("nobody@test.com"))
                .thenReturn(Optional.empty());

        Optional<String> token = service.passwordReset("nobody@test.com");

        assertFalse(token.isPresent());
        Mockito.verify(userRepository, Mockito.never()).save(Mockito.any());
    }
}
