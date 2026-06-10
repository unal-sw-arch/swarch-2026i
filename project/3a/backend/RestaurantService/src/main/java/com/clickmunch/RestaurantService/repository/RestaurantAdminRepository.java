package com.clickmunch.RestaurantService.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.RestaurantService.entity.RestaurantAdmin;

public interface RestaurantAdminRepository extends ListCrudRepository<RestaurantAdmin, Long> {

    @Query("SELECT * FROM restaurant_admins WHERE restaurant_id = :restaurantId")
    List<RestaurantAdmin> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM restaurant_admins WHERE user_id = :userId")
    List<RestaurantAdmin> findByUserId(@Param("userId") Long userId);

    @Query("SELECT * FROM restaurant_admins WHERE restaurant_id = :restaurantId AND user_id = :userId")
    List<RestaurantAdmin> findByRestaurantIdAndUserId(@Param("restaurantId") Long restaurantId, @Param("userId") Long userId);

    @Query("DELETE FROM restaurant_admins WHERE restaurant_id = :restaurantId AND user_id = :userId")
    void deleteByRestaurantIdAndUserId(@Param("restaurantId") Long restaurantId, @Param("userId") Long userId);
}
