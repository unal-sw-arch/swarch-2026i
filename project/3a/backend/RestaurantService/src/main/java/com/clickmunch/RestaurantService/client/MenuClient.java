package com.clickmunch.RestaurantService.client;

import com.clickmunch.RestaurantService.dto.MenuCategoryResponse;
import com.clickmunch.RestaurantService.dto.MenuItemResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Component
public class MenuClient {
    private final RestTemplate restTemplate = new RestTemplate();
    private final String menuServiceUrl = "http://localhost:8084/api/menus";

    public List<MenuCategoryResponse> getMenuByRestaurant(Long restaurantId) {
        MenuCategoryResponse[] response = restTemplate.getForObject(menuServiceUrl + restaurantId, MenuCategoryResponse[].class);
        return response != null ? Arrays.asList(response) : List.of();
    }

    public List<MenuItemResponse> getItemsByCategory(Long categoryId) {
        MenuItemResponse[] response = restTemplate.getForObject(menuServiceUrl + "/categories/" + categoryId, MenuItemResponse[].class);
        return response != null ? Arrays.asList(response) : List.of();
    }

}
