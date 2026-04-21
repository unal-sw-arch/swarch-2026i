package com.restaurant.orderservice.config;

import com.restaurant.orderservice.infrastructure.security.AuthContextFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SUPUESTO DE SEGURIDAD — Fase 1 (stub permissive)
 * La validación de JWT la realiza el API Gateway antes de reenviar la request.
 * Este servicio confía en los headers X-User-Id / X-User-Role / X-Restaurant-Id
 * que el gateway propaga tras validar el token.
 *
 * En Fase 7 se endurecerá: se rechazarán requests sin headers de identidad
 * en los endpoints protegidos.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthContextFilter authContextFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth ->
                // Fase 1: permissive — la autorización por rol se añade en Fase 7
                auth.anyRequest().permitAll())
            .addFilterBefore(authContextFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
