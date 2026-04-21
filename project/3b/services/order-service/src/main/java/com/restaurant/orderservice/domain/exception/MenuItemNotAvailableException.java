package com.restaurant.orderservice.domain.exception;

public class MenuItemNotAvailableException extends RuntimeException {

    private final Long menuItemId;
    private final String productName;

    public MenuItemNotAvailableException(Long menuItemId, String productName) {
        super("Producto '" + productName + "' (id " + menuItemId + ") no está disponible");
        this.menuItemId = menuItemId;
        this.productName = productName;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public String getProductName() {
        return productName;
    }
}
