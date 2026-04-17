package com.restaurant.orderservice.application.usecase;

import com.restaurant.orderservice.application.dto.MenuItemResponse;
import com.restaurant.orderservice.application.dto.MenuItemsResponse;
import com.restaurant.orderservice.domain.exception.MenuNotFoundException;
import com.restaurant.orderservice.domain.model.Menu;
import com.restaurant.orderservice.domain.model.MenuItem;
import com.restaurant.orderservice.domain.repository.MenuItemRepository;
import com.restaurant.orderservice.domain.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GetMenuItemsUseCase {

    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;

    // readOnly = true: optimización — Hibernate no hace flush ni dirty check
    // @Transactional necesario: menu.getRestaurant() es LAZY, requiere sesión activa
    @Transactional(readOnly = true)
    public MenuItemsResponse execute(Long menuId) {
        log.debug("Consultando items del menú id={}", menuId);

        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new MenuNotFoundException(menuId));

        List<MenuItem> items = menuItemRepository.findAllByMenu_Id(menuId);

        log.debug("Menú id={} encontrado con {} items", menuId, items.size());

        return MenuItemsResponse.builder()
                .menuId(menu.getId())
                .restaurantId(menu.getRestaurant().getId())
                .items(items.stream().map(this::toMenuItemResponse).toList())
                .build();
    }

    private MenuItemResponse toMenuItemResponse(MenuItem item) {
        return MenuItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .isAvailable(item.isAvailable())
                .build();
    }
}
