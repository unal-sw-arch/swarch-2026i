package com.restaurant.orderservice.infrastructure.security;

import com.restaurant.orderservice.domain.exception.ForbiddenException;

/**
 * Almacena el AuthContext en un ThreadLocal — un valor por hilo de request.
 * AuthContextFilter lo establece al inicio y lo limpia al final de cada request.
 */
public final class AuthContextHolder {

    private static final ThreadLocal<AuthContext> CONTEXT = new ThreadLocal<>();

    private AuthContextHolder() {}

    public static void set(AuthContext context) {
        CONTEXT.set(context);
    }

    public static AuthContext get() {
        return CONTEXT.get();
    }

    public static AuthContext require() {
        AuthContext context = CONTEXT.get();
        if (context == null) {
            throw new ForbiddenException("Faltan headers de autenticacion del gateway");
        }
        return context;
    }

    public static void clear() {
        CONTEXT.remove();
    }
}
