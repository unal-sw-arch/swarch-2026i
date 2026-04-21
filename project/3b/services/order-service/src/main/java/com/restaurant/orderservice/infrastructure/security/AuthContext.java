package com.restaurant.orderservice.infrastructure.security;

/**
 * SUPUESTO DE SEGURIDAD
 * El API Gateway valida el JWT y propaga la identidad del usuario autenticado
 * como headers internos: X-User-Id, X-User-Role, X-Restaurant-Id.
 * Este record es inmutable y representa el contexto de seguridad de la request.
 */
public record AuthContext(Long userId, String role, Long restaurantId) {

    public boolean isCustomer() {
        return "CUSTOMER".equals(role);
    }

    public boolean isRestaurant() {
        return "RESTAURANT".equals(role);
    }
}
