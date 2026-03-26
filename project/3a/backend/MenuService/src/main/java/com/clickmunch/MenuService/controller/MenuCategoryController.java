package com.clickmunch.MenuService.controller;

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

import com.clickmunch.MenuService.dto.MenuCategoryRequest;
import com.clickmunch.MenuService.entity.MenuCategory;
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
@Tag(name = "MenuCategories", description = "Menu category operations.")
@RequestMapping("/api/menus")
public class MenuCategoryController {
    private final MenuService menuService;

    public MenuCategoryController(MenuService menuService) {
        this.menuService = menuService;
    }

    // CRUD
    // Create a menu item category in a specific restaurant
    @Operation(summary = "Create a menu item category in a specific restaurant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Menu category created",
            content = @Content(schema = @Schema(implementation = MenuCategory.class))),
        @ApiResponse(responseCode = "400", description = "Invalid request",
            content = @Content)
    })
    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuCategory createMenuCategory(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Menu category create request",
            required = true,
            content = @Content(schema = @Schema(implementation = MenuCategoryRequest.class))
        )
        @Valid @RequestBody MenuCategoryRequest req) {
        return menuService.createMenuCategory(req);
    }

    // Get a single menu category
    @Operation(summary = "Get a menu item category by id")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Menu category found",
            content = @Content(schema = @Schema(implementation = MenuCategory.class))),
        @ApiResponse(responseCode = "404", description = "Menu category not found",
            content = @Content)
    })
    @GetMapping("/categories/{categoryId}")
    public MenuCategory getMenuCategory(
        @Parameter(description = "ID of the menu category", required = true)
        @PathVariable String categoryId) {
        try {
            return menuService.findMenuCategoryById(categoryId);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu category not found");
        }
    }

    // Update a menu category
    @Operation(summary = "Update a menu item category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Menu category updated",
            content = @Content(schema = @Schema(implementation = MenuCategory.class))),
        @ApiResponse(responseCode = "404", description = "Menu category not found",
            content = @Content),
        @ApiResponse(responseCode = "400", description = "Invalid request",
            content = @Content)
    })
    @PutMapping("/categories/{categoryId}")
    public MenuCategory updateMenuCategory(
        @Parameter(description = "ID of the menu category", required = true)
        @PathVariable String categoryId,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Menu category update request",
            required = true,
            content = @Content(schema = @Schema(implementation = MenuCategoryRequest.class))
        )
        @RequestBody MenuCategoryRequest req) {
        try {
            return menuService.updateMenuCategory(categoryId, req);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    // Delete a menu category
    @Operation(summary = "Delete a menu item category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Menu category deleted",
            content = @Content),
        @ApiResponse(responseCode = "404", description = "Menu category not found",
            content = @Content)
    })
    @DeleteMapping("/categories/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMenuCategory(
        @Parameter(description = "ID of the menu category", required = true)
        @PathVariable String categoryId) {
        menuService.deleteMenuCategory(categoryId);
    }
}