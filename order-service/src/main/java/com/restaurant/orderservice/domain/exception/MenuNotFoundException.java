package com.restaurant.orderservice.domain.exception;

public class MenuNotFoundException extends RuntimeException {

    private final Long menuId;

    public MenuNotFoundException(Long menuId) {
        super("Menú con id " + menuId + " no encontrado");
        this.menuId = menuId;
    }

    public Long getMenuId() {
        return menuId;
    }
}
