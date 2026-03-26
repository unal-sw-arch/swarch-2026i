package com.clickmunch.MenuService.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickmunch.MenuService.entity.MenuItem;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {

    List<MenuItem> findByCategoryIdOrderByName(String categoryId);

    List<MenuItem> findByCategoryId(String categoryId);

    List<MenuItem> findAllByCategoryIdIn(Collection<String> categoryIds);

    Optional<MenuItem> findByIdAndCategoryId(String id, String categoryId);

    void deleteAllByCategoryIdIn(Collection<String> categoryIds);
}