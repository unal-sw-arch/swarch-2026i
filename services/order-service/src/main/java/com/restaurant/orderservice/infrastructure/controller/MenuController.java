package com.restaurant.orderservice.infrastructure.controller;

import com.restaurant.orderservice.application.dto.MenuItemsResponse;
import com.restaurant.orderservice.application.usecase.GetMenuItemsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/menus")
@RequiredArgsConstructor
public class MenuController {

    private final GetMenuItemsUseCase getMenuItemsUseCase;

    @GetMapping("/{menuId}/items")
    public ResponseEntity<MenuItemsResponse> getMenuItems(@PathVariable Long menuId) {
        return ResponseEntity.ok(getMenuItemsUseCase.execute(menuId));
    }
}
