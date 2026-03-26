package com.clickmunch.MenuService.service;

import com.clickmunch.MenuService.dto.MenuItemRequest;
import com.clickmunch.MenuService.dto.MenuCategoryRequest;
import com.clickmunch.MenuService.dto.MenuRestaurantResponse;
import com.clickmunch.MenuService.dto.MenuCreateRequest;
import com.clickmunch.MenuService.entity.*;
import com.clickmunch.MenuService.repository.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuItemRepository menuItemRepository;

    public MenuService(
        MenuCategoryRepository menuCategoryRepository,
        MenuItemRepository menuItemRepository
    ) {
            this.menuCategoryRepository = menuCategoryRepository;
            this.menuItemRepository = menuItemRepository;
        }

    // Get full menu for a restaurant
    public MenuRestaurantResponse getMenuByRestaurantId(Long restaurantId) {
        List<MenuCategory> categories = menuCategoryRepository.findByRestaurantId(restaurantId);
        if (categories == null || categories.isEmpty()) {
            return new MenuRestaurantResponse(restaurantId, List.of());
        }

        List<String> categoryIds = categories.stream()
                .map(MenuCategory::getId)
                .collect(Collectors.toList());

        List<MenuItem> items = menuItemRepository.findAllByCategoryIdIn(categoryIds);
        return new MenuRestaurantResponse(restaurantId, items);
    }

    // Remove all menu items for a restaurant
    public void deleteMenuByRestaurantId(Long restaurantId) {
        List<MenuCategory> categories = menuCategoryRepository.findByRestaurantId(restaurantId);
        if (categories == null || categories.isEmpty())
            return;

        List<String> categoryIds = categories.stream()
                .map(MenuCategory::getId)
                .collect(Collectors.toList());

        // Delete items first, then categories (no FK cascade in MongoDB)
        menuItemRepository.deleteAllByCategoryIdIn(categoryIds);
        menuCategoryRepository.deleteAllByRestaurantId(restaurantId);
    }

    // CRUD
    public MenuCategory createMenuCategory(MenuCategoryRequest req) {
        MenuCategory cat = new MenuCategory();
        cat.setRestaurantId(req.restaurantId());
        cat.setCategory(req.category());
        
        return menuCategoryRepository.save(cat);
    }

    public MenuItem createMenuItem(String categoryId, MenuItemRequest req) {
        MenuItem item = new MenuItem();
        item.setCategoryId(categoryId);
        item.setName(req.name());
        item.setDescription(req.description());
        item.setPrice(req.price());
        item.setImageUrl(req.imageUrl());

        return menuItemRepository.save(item);
    }

    // Create full menu for a restaurant: categories + items
    public MenuRestaurantResponse createFullMenu(MenuCreateRequest request) {

        Long restaurantId = request.restaurantId();

        if (request == null || request.categories() == null || request.categories().isEmpty()) {
            return new MenuRestaurantResponse(restaurantId, List.of());
        }

        if (restaurantId == null || !restaurantId.equals(request.restaurantId())) {
            throw new IllegalArgumentException("storeId mismatch or null");
        }

        // 1) create category entities
        List<MenuCategory> categoriesToSave = request.categories().stream()
                .map(cReq -> {
                    MenuCategory mc = new MenuCategory();
                    mc.setRestaurantId(restaurantId);
                    mc.setCategory(cReq.category());
                    return mc;
                })
                .collect(Collectors.toList());

        List<MenuCategory> savedCats = menuCategoryRepository.saveAll(categoriesToSave);

        // 2) build items with the saved category ids and save
        List<MenuItem> itemsToSave = new ArrayList<>();
        for (int i = 0; i < savedCats.size(); i++) {
            MenuCategory savedCat = savedCats.get(i);
            List<MenuCreateRequest.ItemRequest> itemReqs = request.categories().get(i).items();
            if (itemReqs == null) continue;
            for (MenuCreateRequest.ItemRequest ir : itemReqs) {
                MenuItem mi = new MenuItem();
                mi.setCategoryId(savedCat.getId());
                mi.setName(ir.name());
                mi.setDescription(ir.description());
                mi.setPrice(ir.price());
                mi.setImageUrl(ir.imageUrl());
                itemsToSave.add(mi);
            }
        }

        List<MenuItem> savedItems = menuItemRepository.saveAll(itemsToSave);

        // return response with saved items
        return new MenuRestaurantResponse(restaurantId, savedItems);
    }

    public MenuCategory findMenuCategoryById(String id) {
        return menuCategoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Menu Category not found"));
    }

    public MenuItem findMenuItemById(String id) {
        return menuItemRepository.findById(id).orElseThrow(() -> new RuntimeException("Menu Item not found"));
    }

    public List<MenuItem> findMenuItemsByRestaurantId(Long restaurantId) {
        List<MenuCategory> categories = menuCategoryRepository.findByRestaurantId(restaurantId);
        if (categories == null || categories.isEmpty())
            throw new RuntimeException("Invalid restaurant ID or restaurant has no Item Categries.");

        List<String> categoryIds = categories.stream()
                .map(MenuCategory::getId)
                .collect(Collectors.toList());     

        return menuItemRepository.findAllByCategoryIdIn(categoryIds);
    }

    public MenuCategory updateMenuCategory(String menuCategoryId, MenuCategoryRequest req) {
        MenuCategory existing = menuCategoryRepository.findById(menuCategoryId)
                    .orElseThrow(() -> new RuntimeException("Menu Category not found."));
    
        MenuCategory updated = new MenuCategory();
        updated.setId(existing.getId());
        updated.setRestaurantId(existing.getRestaurantId());
        updated.setCategory(req.category());

        return menuCategoryRepository.save(updated);
    }

    public MenuItem updateMenuItem(String menuItemId, MenuItemRequest req) {
        MenuItem existing = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Menu Item not found"));
        MenuItem updated = new MenuItem();
        updated.setId(existing.getId());
        updated.setCategoryId(existing.getCategoryId());
        updated.setName(req.name() != null ? req.name() : existing.getName());
        updated.setDescription(req.description() != null ? req.description() : existing.getDescription());
        updated.setPrice(req.price() != null ? req.price() : existing.getPrice());
        updated.setImageUrl(req.imageUrl() != null ? req.imageUrl() : existing.getImageUrl());

        return menuItemRepository.save(updated);
    }

    public void deleteMenuCategory(String menuCategoryId) {
        // Delete associated items first (no FK cascade in MongoDB)
        List<MenuItem> items = menuItemRepository.findByCategoryId(menuCategoryId);
        if (items != null && !items.isEmpty()) {
            menuItemRepository.deleteAll(items);
        }
        menuCategoryRepository.deleteById(menuCategoryId);
    }

    public void deleteMenuItem(String menuItemId) {
        menuItemRepository.deleteById(menuItemId);
    }
}
