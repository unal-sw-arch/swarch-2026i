package com.clickmunch.RestaurantService.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.RestaurantService.entity.OperatingHours;

public interface OperatingHoursRepository extends ListCrudRepository<OperatingHours, Long> {

    @Query("SELECT * FROM operating_hours WHERE restaurant_id = :restaurantId ORDER BY CASE day_of_week WHEN 'MONDAY' THEN 1 WHEN 'TUESDAY' THEN 2 WHEN 'WEDNESDAY' THEN 3 WHEN 'THURSDAY' THEN 4 WHEN 'FRIDAY' THEN 5 WHEN 'SATURDAY' THEN 6 WHEN 'SUNDAY' THEN 7 END")
    List<OperatingHours> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM operating_hours WHERE restaurant_id = :restaurantId AND day_of_week = :dayOfWeek")
    List<OperatingHours> findByRestaurantIdAndDay(@Param("restaurantId") Long restaurantId, @Param("dayOfWeek") String dayOfWeek);

    @Query("DELETE FROM operating_hours WHERE restaurant_id = :restaurantId")
    void deleteByRestaurantId(@Param("restaurantId") Long restaurantId);
}
