package com.clickmunch.RatingService.repository;

import com.clickmunch.RatingService.entity.WaiterRating;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WaiterRatingRepository extends ListCrudRepository<WaiterRating, Long> {

    @Query("SELECT * FROM waiter_ratings WHERE waiter_id = :waiterId ORDER BY created_at DESC")
    List<WaiterRating> findByWaiterId(@Param("waiterId") Long waiterId);

    @Query("SELECT * FROM waiter_ratings WHERE restaurant_id = :restaurantId ORDER BY created_at DESC")
    List<WaiterRating> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT AVG(score) FROM waiter_ratings WHERE waiter_id = :waiterId")
    Double getAverageScoreByWaiterId(@Param("waiterId") Long waiterId);

    @Query("SELECT COUNT(*) FROM waiter_ratings WHERE waiter_id = :waiterId")
    Long countByWaiterId(@Param("waiterId") Long waiterId);
}
