package com.restaurant.orderservice.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * SUPUESTO DE SEGURIDAD
 * El API Gateway valida el JWT y añade los siguientes headers antes de reenviar:
 *   X-User-Id       — Long, ID del usuario autenticado
 *   X-User-Role     — "CUSTOMER" | "RESTAURANT"
 *   X-Restaurant-Id — Long, solo presente si el rol es RESTAURANT
 *
 * Este filtro extrae esos headers y construye el AuthContext disponible
 * en AuthContextHolder para toda la request. Se limpia en el finally.
 *
 * Los use cases de Fase 4 y 7 usarán AuthContextHolder.get() para extraer
 * customerId y restaurantId sin aceptarlos del request body.
 */
@Slf4j
@Component
public class AuthContextFilter extends OncePerRequestFilter {

    private static final String HEADER_USER_ID        = "X-User-Id";
    private static final String HEADER_USER_ROLE      = "X-User-Role";
    private static final String HEADER_RESTAURANT_ID  = "X-Restaurant-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String rawUserId       = request.getHeader(HEADER_USER_ID);
            String role            = request.getHeader(HEADER_USER_ROLE);
            String rawRestaurantId = request.getHeader(HEADER_RESTAURANT_ID);

            if (rawUserId != null && role != null) {
                Long userId       = Long.parseLong(rawUserId);
                Long restaurantId = rawRestaurantId != null ? Long.parseLong(rawRestaurantId) : null;
                AuthContextHolder.set(new AuthContext(userId, role, restaurantId));
                log.debug("AuthContext establecido: userId={} role={}", userId, role);
            }

            filterChain.doFilter(request, response);
        } finally {
            AuthContextHolder.clear();
        }
    }
}
