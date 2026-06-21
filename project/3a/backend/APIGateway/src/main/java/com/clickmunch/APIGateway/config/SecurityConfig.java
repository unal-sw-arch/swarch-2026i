package com.clickmunch.APIGateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Reactive Spring Security config for the API Gateway.
 *
 * The gateway does not use Spring Security's JWT machinery. JWT validation
 * is performed by the custom {@link
 * com.clickmunch.APIGateway.security.JwtAuthenticationFilter} which is
 * attached per-route in {@link RouteConfig}. This config only disables the
 * auto-configured defaults (basic auth form, CSRF tokens) that would
 * otherwise interfere with the gateway's proxy behaviour.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain filterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(ex -> ex.anyExchange().permitAll())
                .build();
    }
}
