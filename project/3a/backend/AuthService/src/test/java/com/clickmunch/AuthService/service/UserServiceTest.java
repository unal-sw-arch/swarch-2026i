package com.clickmunch.AuthService.service;

import com.clickmunch.AuthService.config.JwtTokenUtil;
import com.clickmunch.AuthService.entity.User;
import com.clickmunch.AuthService.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class UserServiceTest {

    @Test
    public void testPasswordReset() {

        UserRepository userRepository = org.mockito.Mockito.mock(UserRepository.class);
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        JwtTokenUtil jwtTokenUtil = Mockito.mock(JwtTokenUtil.class);
        AuthService userService = new AuthService(userRepository, bCryptPasswordEncoder, jwtTokenUtil);

        User user = new User();
        user.setId(1L);
        user.setEmail("mockito@test.com");
        user.setPasswordHash(bCryptPasswordEncoder.encode("123456"));

        Mockito.when(userRepository.findByEmail("mockito@test.com")).thenReturn(Optional.of(user));

        boolean resetResult = userService.resetPassword("mockito@test.com", "newpassword");

        assertTrue(resetResult);
        Mockito.verify(userRepository).save(Mockito.argThat(savedUser ->
            bCryptPasswordEncoder.matches("newpassword", savedUser.getPasswordHash())
        ));

        Mockito.verify(userRepository, Mockito.times(1)).findByEmail("mockito@test.com");


    }

}
