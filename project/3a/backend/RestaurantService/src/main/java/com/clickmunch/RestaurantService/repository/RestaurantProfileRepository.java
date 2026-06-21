package com.clickmunch.RestaurantService.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.repository.ListCrudRepository;

import com.clickmunch.RestaurantService.entity.RestaurantProfile;

public interface RestaurantProfileRepository extends ListCrudRepository<RestaurantProfile, Long> {
    List<RestaurantProfile> findByRestaurantIdIn(Collection<Long> restaurantIds);
}

