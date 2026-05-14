package com.clickmunch.RatingService.repository;

import com.clickmunch.RatingService.entity.RestaurantRating;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRatingRepository extends ListCrudRepository<RestaurantRating, Long> {

    @Query("SELECT * FROM restaurant_ratings WHERE restaurant_id = :restaurantId ORDER BY created_at DESC")
    List<RestaurantRating> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM restaurant_ratings WHERE customer_id = :customerId ORDER BY created_at DESC")
    List<RestaurantRating> findByCustomerId(@Param("customerId") Long customerId);

    @Query("SELECT AVG(score) FROM restaurant_ratings WHERE restaurant_id = :restaurantId")
    Double getAverageScoreByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(*) FROM restaurant_ratings WHERE restaurant_id = :restaurantId")
    Long countByRestaurantId(@Param("restaurantId") Long restaurantId);
}
