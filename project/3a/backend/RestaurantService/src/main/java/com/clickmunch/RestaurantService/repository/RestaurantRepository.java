package com.clickmunch.RestaurantService.repository;

import com.clickmunch.RestaurantService.entity.Restaurant;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface RestaurantRepository extends ListCrudRepository<Restaurant, Long> {
    @Query("SELECT * FROM restaurants WHERE owner_id = :ownerId ORDER BY created_at DESC")
    List<Restaurant> findByOwnerId(Long ownerId);

    List<Restaurant> findAllByLocationIdIn(Collection<Long> locationId);

    @Query("SELECT r.* FROM restaurants r JOIN restaurant_admins ra ON r.id = ra.restaurant_id WHERE ra.user_id = :userId ORDER BY r.created_at DESC")
    List<Restaurant> findByAdminUserId(@Param("userId") Long userId);

}
