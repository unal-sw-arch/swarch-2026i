package com.clickmunch.RestaurantService.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.RestaurantService.entity.RestaurantTable;

public interface RestaurantTableRepository extends ListCrudRepository<RestaurantTable, Long> {

    @Query("SELECT * FROM restaurant_tables WHERE restaurant_id = :restaurantId ORDER BY table_number")
    List<RestaurantTable> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM restaurant_tables WHERE restaurant_id = :restaurantId AND status = :status ORDER BY table_number")
    List<RestaurantTable> findByRestaurantIdAndStatus(@Param("restaurantId") Long restaurantId, @Param("status") String status);

    @Query("SELECT * FROM restaurant_tables WHERE restaurant_id = :restaurantId AND seats >= :minSeats AND status = 'AVAILABLE' ORDER BY seats")
    List<RestaurantTable> findAvailableByRestaurantIdAndMinSeats(@Param("restaurantId") Long restaurantId, @Param("minSeats") Integer minSeats);
}
