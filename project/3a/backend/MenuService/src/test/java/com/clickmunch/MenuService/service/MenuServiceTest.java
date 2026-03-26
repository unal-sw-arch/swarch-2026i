package com.clickmunch.MenuService.service;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clickmunch.MenuService.dto.MenuCategoryRequest;
import com.clickmunch.MenuService.dto.MenuCreateRequest;
import com.clickmunch.MenuService.dto.MenuItemRequest;
import com.clickmunch.MenuService.dto.MenuRestaurantResponse;
import com.clickmunch.MenuService.entity.Category;
import com.clickmunch.MenuService.entity.MenuCategory;
import com.clickmunch.MenuService.entity.MenuItem;
import com.clickmunch.MenuService.repository.MenuCategoryRepository;
import com.clickmunch.MenuService.repository.MenuItemRepository;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private MenuCategoryRepository menuCategoryRepository;

    @Mock
    private MenuItemRepository menuItemRepository;

    @InjectMocks
    private MenuService menuService;

    @Captor
    private ArgumentCaptor<List<MenuCategory>> categoryListCaptor;

    @Captor
    private ArgumentCaptor<List<MenuItem>> itemListCaptor;

    private MenuCategory createMenuCategory(String id, Long restaurantId, Category category) {
        MenuCategory mc = new MenuCategory();
        mc.setId(id);
        mc.setRestaurantId(restaurantId);
        mc.setCategory(category);
        return mc;
    }

    private MenuItem createMenuItem(String id, String categoryId, String name, BigDecimal price) {
        MenuItem item = new MenuItem();
        item.setId(id);
        item.setCategoryId(categoryId);
        item.setName(name);
        item.setDescription("Description for " + name);
        item.setPrice(price);
        item.setImageUrl("http://example.com/" + name + ".jpg");
        return item;
    }

    @Nested
    @DisplayName("getMenuByRestaurantId Tests")
    class GetMenuByRestaurantIdTests {

        @Test
        @DisplayName("Should return menu with items when restaurant has categories")
        void shouldReturnMenuWithItems() {
            Long restaurantId = 1L;
            MenuCategory category = createMenuCategory("cat10", restaurantId, Category.PLATO);
            MenuItem item = createMenuItem("item100", "cat10", "Burger", BigDecimal.valueOf(9.99));

            when(menuCategoryRepository.findByRestaurantId(restaurantId))
                    .thenReturn(List.of(category));
            when(menuItemRepository.findAllByCategoryIdIn(List.of("cat10")))
                    .thenReturn(List.of(item));

            MenuRestaurantResponse response = menuService.getMenuByRestaurantId(restaurantId);

            assertThat(response.storeId()).isEqualTo(restaurantId);
            assertThat(response.menuItems()).hasSize(1);
            assertThat(response.menuItems().get(0).getName()).isEqualTo("Burger");
            verify(menuCategoryRepository).findByRestaurantId(restaurantId);
            verify(menuItemRepository).findAllByCategoryIdIn(List.of("cat10"));
        }

        @Test
        @DisplayName("Should return empty menu when restaurant has no categories")
        void shouldReturnEmptyMenuWhenNoCategories() {
            Long restaurantId = 1L;
            when(menuCategoryRepository.findByRestaurantId(restaurantId))
                    .thenReturn(Collections.emptyList());

            MenuRestaurantResponse response = menuService.getMenuByRestaurantId(restaurantId);

            assertThat(response.storeId()).isEqualTo(restaurantId);
            assertThat(response.menuItems()).isEmpty();
            verify(menuItemRepository, never()).findAllByCategoryIdIn(anyCollection());
        }

        @Test
        @DisplayName("Should handle null categories list")
        void shouldHandleNullCategoriesList() {
            Long restaurantId = 1L;
            when(menuCategoryRepository.findByRestaurantId(restaurantId)).thenReturn(null);

            MenuRestaurantResponse response = menuService.getMenuByRestaurantId(restaurantId);

            assertThat(response.storeId()).isEqualTo(restaurantId);
            assertThat(response.menuItems()).isEmpty();
        }
    }

    @Nested
    @DisplayName("deleteMenuByRestaurantId Tests")
    class DeleteMenuByRestaurantIdTests {

        @Test
        @DisplayName("Should delete all items and categories for restaurant")
        void shouldDeleteAllItemsAndCategories() {
            Long restaurantId = 1L;
            MenuCategory category = createMenuCategory("cat10", restaurantId, Category.BEBIDA);

            when(menuCategoryRepository.findByRestaurantId(restaurantId))
                    .thenReturn(List.of(category));

            menuService.deleteMenuByRestaurantId(restaurantId);

            verify(menuItemRepository).deleteAllByCategoryIdIn(List.of("cat10"));
            verify(menuCategoryRepository).deleteAllByRestaurantId(restaurantId);
        }

        @Test
        @DisplayName("Should do nothing when restaurant has no categories")
        void shouldDoNothingWhenNoCategories() {
            Long restaurantId = 1L;
            when(menuCategoryRepository.findByRestaurantId(restaurantId))
                    .thenReturn(Collections.emptyList());

            menuService.deleteMenuByRestaurantId(restaurantId);

            verify(menuItemRepository, never()).deleteAllByCategoryIdIn(anyCollection());
            verify(menuCategoryRepository, never()).deleteAllByRestaurantId(anyLong());
        }
    }

    @Nested
    @DisplayName("createMenuCategory Tests")
    class CreateMenuCategoryTests {

        @Test
        @DisplayName("Should create and return menu category")
        void shouldCreateMenuCategory() {
            MenuCategoryRequest request = new MenuCategoryRequest(1L, Category.ENTRADA);
            MenuCategory savedCategory = createMenuCategory("cat10", 1L, Category.ENTRADA);

            when(menuCategoryRepository.save(any(MenuCategory.class))).thenReturn(savedCategory);

            MenuCategory result = menuService.createMenuCategory(request);

            assertThat(result.getId()).isEqualTo("cat10");
            assertThat(result.getRestaurantId()).isEqualTo(1L);
            assertThat(result.getCategory()).isEqualTo(Category.ENTRADA);
            verify(menuCategoryRepository).save(any(MenuCategory.class));
        }
    }

    @Nested
    @DisplayName("createMenuItem Tests")
    class CreateMenuItemTests {

        @Test
        @DisplayName("Should create and return menu item")
        void shouldCreateMenuItem() {
            String categoryId = "cat10";
            MenuItemRequest request = new MenuItemRequest(
                    "Pizza", "Delicious pizza", BigDecimal.valueOf(12.99), "http://example.com/pizza.jpg"
            );
            MenuItem savedItem = createMenuItem("item100", categoryId, "Pizza", BigDecimal.valueOf(12.99));

            when(menuItemRepository.save(any(MenuItem.class))).thenReturn(savedItem);

            MenuItem result = menuService.createMenuItem(categoryId, request);

            assertThat(result.getId()).isEqualTo("item100");
            assertThat(result.getCategoryId()).isEqualTo(categoryId);
            assertThat(result.getName()).isEqualTo("Pizza");
            verify(menuItemRepository).save(any(MenuItem.class));
        }
    }

    @Nested
    @DisplayName("createFullMenu Tests")
    class CreateFullMenuTests {

        @Test
        @DisplayName("Should create full menu with categories and items")
        void shouldCreateFullMenu() {
            Long restaurantId = 1L;
            MenuCreateRequest.ItemRequest itemReq = new MenuCreateRequest.ItemRequest(
                    "Salad", "Fresh salad", BigDecimal.valueOf(7.99), "http://example.com/salad.jpg"
            );
            MenuCreateRequest.CategoryRequest categoryReq = new MenuCreateRequest.CategoryRequest(
                    Category.ENSALADA, List.of(itemReq)
            );
            MenuCreateRequest request = new MenuCreateRequest(restaurantId, List.of(categoryReq));

            MenuCategory savedCategory = createMenuCategory("cat10", restaurantId, Category.ENSALADA);
            MenuItem savedItem = createMenuItem("item100", "cat10", "Salad", BigDecimal.valueOf(7.99));

            when(menuCategoryRepository.saveAll(anyList())).thenReturn(List.of(savedCategory));
            when(menuItemRepository.saveAll(anyList())).thenReturn(List.of(savedItem));

            MenuRestaurantResponse response = menuService.createFullMenu(request);

            assertThat(response.storeId()).isEqualTo(restaurantId);
            assertThat(response.menuItems()).hasSize(1);
            verify(menuCategoryRepository).saveAll(categoryListCaptor.capture());
            verify(menuItemRepository).saveAll(itemListCaptor.capture());
        }

        @Test
        @DisplayName("Should return empty response when categories list is null")
        void shouldReturnEmptyWhenCategoriesNull() {
            MenuCreateRequest request = new MenuCreateRequest(1L, null);

            MenuRestaurantResponse response = menuService.createFullMenu(request);

            assertThat(response.menuItems()).isEmpty();
            verify(menuCategoryRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("Should return empty response when categories list is empty")
        void shouldReturnEmptyWhenCategoriesEmpty() {
            MenuCreateRequest request = new MenuCreateRequest(1L, Collections.emptyList());

            MenuRestaurantResponse response = menuService.createFullMenu(request);

            assertThat(response.menuItems()).isEmpty();
            verify(menuCategoryRepository, never()).saveAll(anyList());
        }

        @Test
        @DisplayName("Should throw exception when restaurantId is null")
        void shouldThrowWhenRestaurantIdNull() {
            MenuCreateRequest.CategoryRequest categoryReq = new MenuCreateRequest.CategoryRequest(
                    Category.BEBIDA, List.of()
            );
            MenuCreateRequest request = new MenuCreateRequest(null, List.of(categoryReq));

            assertThatThrownBy(() -> menuService.createFullMenu(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("storeId mismatch or null");
        }
    }

    @Nested
    @DisplayName("findMenuCategoryById Tests")
    class FindMenuCategoryByIdTests {

        @Test
        @DisplayName("Should return category when found")
        void shouldReturnCategoryWhenFound() {
            String id = "cat10";
            MenuCategory category = createMenuCategory(id, 1L, Category.POSTRE);
            when(menuCategoryRepository.findById(id)).thenReturn(Optional.of(category));

            MenuCategory result = menuService.findMenuCategoryById(id);

            assertThat(result.getId()).isEqualTo(id);
            assertThat(result.getCategory()).isEqualTo(Category.POSTRE);
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void shouldThrowWhenCategoryNotFound() {
            String id = "cat999";
            when(menuCategoryRepository.findById(id)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> menuService.findMenuCategoryById(id))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Menu Category not found");
        }
    }

    @Nested
    @DisplayName("findMenuItemById Tests")
    class FindMenuItemByIdTests {

        @Test
        @DisplayName("Should return item when found")
        void shouldReturnItemWhenFound() {
            String id = "item100";
            MenuItem item = createMenuItem(id, "cat10", "Steak", BigDecimal.valueOf(24.99));
            when(menuItemRepository.findById(id)).thenReturn(Optional.of(item));

            MenuItem result = menuService.findMenuItemById(id);

            assertThat(result.getId()).isEqualTo(id);
            assertThat(result.getName()).isEqualTo("Steak");
        }

        @Test
        @DisplayName("Should throw exception when item not found")
        void shouldThrowWhenItemNotFound() {
            String id = "item999";
            when(menuItemRepository.findById(id)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> menuService.findMenuItemById(id))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Menu Item not found");
        }
    }

    @Nested
    @DisplayName("findMenuItemsByRestaurantId Tests")
    class FindMenuItemsByRestaurantIdTests {

        @Test
        @DisplayName("Should return items for restaurant")
        void shouldReturnItemsForRestaurant() {
            Long restaurantId = 1L;
            MenuCategory category = createMenuCategory("cat10", restaurantId, Category.ADICIONAL);
            MenuItem item = createMenuItem("item100", "cat10", "Fries", BigDecimal.valueOf(3.99));

            when(menuCategoryRepository.findByRestaurantId(restaurantId))
                    .thenReturn(List.of(category));
            when(menuItemRepository.findAllByCategoryIdIn(List.of("cat10")))
                    .thenReturn(List.of(item));

            List<MenuItem> result = menuService.findMenuItemsByRestaurantId(restaurantId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Fries");
        }

        @Test
        @DisplayName("Should throw exception when restaurant has no categories")
        void shouldThrowWhenNoCategories() {
            Long restaurantId = 1L;
            when(menuCategoryRepository.findByRestaurantId(restaurantId))
                    .thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> menuService.findMenuItemsByRestaurantId(restaurantId))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid restaurant ID");
        }
    }

    @Nested
    @DisplayName("updateMenuCategory Tests")
    class UpdateMenuCategoryTests {

        @Test
        @DisplayName("Should update category successfully")
        void shouldUpdateCategory() {
            String id = "cat10";
            MenuCategory existing = createMenuCategory(id, 1L, Category.ENTRADA);
            MenuCategoryRequest request = new MenuCategoryRequest(1L, Category.PLATO);

            when(menuCategoryRepository.findById(id)).thenReturn(Optional.of(existing));
            when(menuCategoryRepository.save(any(MenuCategory.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            MenuCategory result = menuService.updateMenuCategory(id, request);

            assertThat(result.getCategory()).isEqualTo(Category.PLATO);
            assertThat(result.getId()).isEqualTo(id);
        }

        @Test
        @DisplayName("Should throw exception when category not found")
        void shouldThrowWhenCategoryNotFound() {
            String id = "cat999";
            when(menuCategoryRepository.findById(id)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> menuService.updateMenuCategory(id,
                    new MenuCategoryRequest(1L, Category.BEBIDA)))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessage("Menu Category not found.");
        }
    }

    @Nested
    @DisplayName("updateMenuItem Tests")
    class UpdateMenuItemTests {

        @Test
        @DisplayName("Should update item with all fields")
        void shouldUpdateItemWithAllFields() {
            String id = "item100";
            MenuItem existing = createMenuItem(id, "cat10", "Old Name", BigDecimal.valueOf(9.99));
            MenuItemRequest request = new MenuItemRequest(
                    "New Name", "New Description", BigDecimal.valueOf(14.99), "http://new.jpg"
            );

            when(menuItemRepository.findById(id)).thenReturn(Optional.of(existing));
            when(menuItemRepository.save(any(MenuItem.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            MenuItem result = menuService.updateMenuItem(id, request);

            assertThat(result.getName()).isEqualTo("New Name");
            assertThat(result.getDescription()).isEqualTo("New Description");
            assertThat(result.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(14.99));
        }

        @Test
        @DisplayName("Should preserve existing values when request fields are null")
        void shouldPreserveExistingWhenNull() {
            String id = "item100";
            MenuItem existing = createMenuItem(id, "cat10", "Original", BigDecimal.valueOf(9.99));
            MenuItemRequest request = new MenuItemRequest(null, null, null, null);

            when(menuItemRepository.findById(id)).thenReturn(Optional.of(existing));
            when(menuItemRepository.save(any(MenuItem.class)))
                    .thenAnswer(inv -> inv.getArgument(0));

            MenuItem result = menuService.updateMenuItem(id, request);

            assertThat(result.getName()).isEqualTo("Original");
            assertThat(result.getPrice()).isEqualByComparingTo(BigDecimal.valueOf(9.99));
        }
    }

    @Nested
    @DisplayName("Delete Operations Tests")
    class DeleteOperationsTests {

        @Test
        @DisplayName("Should delete menu category")
        void shouldDeleteMenuCategory() {
            String id = "cat10";

            when(menuItemRepository.findByCategoryId(id)).thenReturn(List.of());

            menuService.deleteMenuCategory(id);

            verify(menuCategoryRepository).deleteById(id);
        }

        @Test
        @DisplayName("Should delete menu item")
        void shouldDeleteMenuItem() {
            String id = "item100";

            menuService.deleteMenuItem(id);

            verify(menuItemRepository).deleteById(id);
        }
    }
}
