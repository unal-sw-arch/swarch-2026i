package com.clickmunch.MenuService.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.clickmunch.MenuService.dto.MenuCreateRequest;
import com.clickmunch.MenuService.dto.MenuItemRequest;
import com.clickmunch.MenuService.dto.MenuRestaurantResponse;
import com.clickmunch.MenuService.entity.MenuItem;
import com.clickmunch.MenuService.service.MenuService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "MenuItems", description = "Menu item operations.")
@RequestMapping("/api/menus")
public class MenuItemController {
    private final MenuService menuService;

    public MenuItemController(MenuService menuService) {
        this.menuService = menuService;
    }

    // CRUD
    // Create a menu item in a specific category
    @Operation(summary = "Create a menu item in a specific category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Menu item created",
            content = @Content(schema = @Schema(implementation = MenuItem.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request",
            content = @Content)
    })
    @PostMapping("/categories/{categoryId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItem createMenuItem(
        @Parameter(description = "ID of the category to create the item in", required = true)
        @PathVariable String categoryId,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Menu item create request",
            required = true,
            content = @Content(schema = @Schema(implementation = MenuItemRequest.class))
        )
        @Valid @RequestBody MenuItemRequest req) {
        return menuService.createMenuItem(categoryId, req);
    }

    // Get a single menu item
    @Operation(summary = "Get a menu item by id")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Menu item found",
            content = @Content(schema = @Schema(implementation = MenuItem.class))),
        @ApiResponse(responseCode = "404", description = "Menu item not found",
            content = @Content)
    })
    @GetMapping("/items/{itemId}")
    public MenuItem getMenuItem(
        @Parameter(description = "ID of the menu item", required = true)
        @PathVariable String itemId) {
        try {
            return menuService.findMenuItemById(itemId);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found");
        }
    }


    // Update a menu item
    @Operation(summary = "Update a menu item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Menu item updated",
            content = @Content(schema = @Schema(implementation = MenuItem.class))),
        @ApiResponse(responseCode = "404", description = "Menu item not found",
            content = @Content),
        @ApiResponse(responseCode = "400", description = "Invalid request",
            content = @Content)
    })
    @PutMapping("/items/{itemId}")
    public MenuItem updateMenuItem(
        @Parameter(description = "ID of the menu item", required = true)
        @PathVariable String itemId,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Menu item update request",
            required = true,
            content = @Content(schema = @Schema(implementation = MenuItemRequest.class))
        )
        @RequestBody MenuItemRequest req) {
        try {
            return menuService.updateMenuItem(itemId, req);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Delete a menu item
    @Operation(summary = "Delete a menu item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Menu item deleted", content = @Content),
        @ApiResponse(responseCode = "404", description = "Menu item not found", content = @Content)
    })
    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenuItem(
        @Parameter(description = "ID of the menu item", required = true)
        @PathVariable String itemId) {
        menuService.deleteMenuItem(itemId);
    }

    // Restaurant-specific operations
    // Create full menu for a restaurant (categories + items)
    @Operation(summary = "Create full menu for a restaurant (categories + items)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Full menu created",
            content = @Content(schema = @Schema(implementation = MenuRestaurantResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content)
    })
    @PostMapping("")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuRestaurantResponse createFullMenu(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Full menu create request",
            required = true,
            content = @Content(schema = @Schema(implementation = MenuCreateRequest.class))
        )
        @Valid @RequestBody MenuCreateRequest request) {
        try {
            return menuService.createFullMenu(request);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    // Get full menu for a restaurant
    @Operation(summary = "Get full menu for a restaurant by restaurantId")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Full menu found",
            content = @Content(schema = @Schema(implementation = MenuRestaurantResponse.class))),
        @ApiResponse(responseCode = "404", description = "Menu not found", content = @Content)
    })
    @GetMapping("/restaurants/{restaurantId}")
    public MenuRestaurantResponse getMenuByRestaurantId(
        @Parameter(description = "ID of the restaurant", required = true)
        @PathVariable Long restaurantId) {
        return menuService.getMenuByRestaurantId(restaurantId);
    }

    // Get all items for a restaurant (lookups via categories' restaurant_id)
    @Operation(summary = "Get all menu items for a restaurant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Menu items found",
            content = @Content(schema = @Schema(implementation = MenuItem.class))),
        @ApiResponse(responseCode = "404", description = "Menu items not found", content = @Content)
    })
    @GetMapping("/restaurants/{restaurantId}/items")
    public List<MenuItem> getMenuItemsByRestaurantId(
        @Parameter(description = "ID of the restaurant", required = true)
        @PathVariable Long restaurantId) {
        try {
            return menuService.findMenuItemsByRestaurantId(restaurantId);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Delete all menu categories & items for a restaurant
    @Operation(summary = "Delete all menu categories and items for a restaurant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Menu deleted for restaurant", content = @Content),
        @ApiResponse(responseCode = "404", description = "Menu not found for restaurant", content = @Content)
    })
    @DeleteMapping("/restaurants/{restaurantId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenuByRestaurantId(
        @Parameter(description = "ID of the restaurant", required = true)
        @PathVariable Long restaurantId) {
        menuService.deleteMenuByRestaurantId(restaurantId);
    }
}
