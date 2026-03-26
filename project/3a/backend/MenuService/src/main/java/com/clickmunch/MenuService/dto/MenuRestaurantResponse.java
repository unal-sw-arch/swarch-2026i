package com.clickmunch.MenuService.dto;

import com.clickmunch.MenuService.entity.MenuItem;

import java.util.List;

public record MenuRestaurantResponse(
    Long storeId,
    List<MenuItem>menuItems
){
}
