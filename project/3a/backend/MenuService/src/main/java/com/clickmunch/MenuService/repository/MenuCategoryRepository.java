package com.clickmunch.MenuService.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickmunch.MenuService.entity.MenuCategory;

@Repository
public interface MenuCategoryRepository extends MongoRepository<MenuCategory, String> {

    List<MenuCategory> findByRestaurantIdOrderByCategory(Long restaurantId);

    List<MenuCategory> findByRestaurantId(Long restaurantId);

    List<MenuCategory> findAllByRestaurantIdIn(Collection<Long> restaurantIds);

    void deleteAllByRestaurantId(Long restaurantId);
}