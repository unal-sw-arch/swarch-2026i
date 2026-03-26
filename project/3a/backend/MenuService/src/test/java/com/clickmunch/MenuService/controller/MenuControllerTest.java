package com.clickmunch.MenuService.controller;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.clickmunch.MenuService.dto.MenuCategoryRequest;
import com.clickmunch.MenuService.dto.MenuItemRequest;
import com.clickmunch.MenuService.entity.Category;
import com.clickmunch.MenuService.entity.MenuCategory;
import com.clickmunch.MenuService.entity.MenuItem;
import com.clickmunch.MenuService.service.MenuService;

@WebMvcTest({MenuItemController.class, MenuCategoryController.class})
class MenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MenuService menuService;

    @Test
    void createCategory_returnsCreated() throws Exception {
        MenuCategory cat = new MenuCategory();
        cat.setId("cat1");
        cat.setRestaurantId(1L);
        cat.setCategory(Category.ENTRADA);

        Mockito.when(menuService.createMenuCategory(Mockito.any(MenuCategoryRequest.class)))
                .thenReturn(cat);

        mockMvc.perform(post("/api/menus/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"restaurantId\":1,\"category\":\"ENTRADA\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    void createItem_returnsCreated() throws Exception {
        MenuItem item = new MenuItem();
        item.setId("item1");
        item.setCategoryId("cat1");
        item.setName("Burger");
        item.setDescription("Tasty");
        item.setPrice(BigDecimal.valueOf(9.99));

        Mockito.when(menuService.createMenuItem(Mockito.eq("cat1"), Mockito.any(MenuItemRequest.class)))
                .thenReturn(item);

        mockMvc.perform(post("/api/menus/categories/cat1/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Burger\",\"description\":\"Tasty\",\"price\":9.99}"))
                .andExpect(status().isCreated());
    }

    @Test
    void getMenuByRestaurant_returnsOk() throws Exception {
        Mockito.when(menuService.getMenuByRestaurantId(1L)).thenReturn(null);
        mockMvc.perform(get("/api/menus/restaurants/1"))
                .andExpect(status().isOk());
    }

}
