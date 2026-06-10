package com.restaurant.orderservice.domain.exception;

public class MenuItemNotFoundException extends RuntimeException {

    private final Long menuItemId;

    public MenuItemNotFoundException(Long menuItemId) {
        super("Producto con id " + menuItemId + " no encontrado");
        this.menuItemId = menuItemId;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }
}
