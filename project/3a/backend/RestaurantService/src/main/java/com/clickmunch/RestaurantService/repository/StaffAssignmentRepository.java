package com.clickmunch.RestaurantService.repository;

import java.util.List;

import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import com.clickmunch.RestaurantService.entity.StaffAssignment;

public interface StaffAssignmentRepository extends ListCrudRepository<StaffAssignment, Long> {

    @Query("SELECT * FROM staff_assignments WHERE restaurant_id = :restaurantId ORDER BY role, assigned_at DESC")
    List<StaffAssignment> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT * FROM staff_assignments WHERE restaurant_id = :restaurantId AND role = :role AND active = true ORDER BY assigned_at DESC")
    List<StaffAssignment> findActiveByRestaurantIdAndRole(@Param("restaurantId") Long restaurantId, @Param("role") String role);

    @Query("SELECT * FROM staff_assignments WHERE user_id = :userId AND active = true ORDER BY assigned_at DESC")
    List<StaffAssignment> findActiveByUserId(@Param("userId") Long userId);

    @Query("SELECT * FROM staff_assignments WHERE restaurant_id = :restaurantId AND user_id = :userId")
    List<StaffAssignment> findByRestaurantIdAndUserId(@Param("restaurantId") Long restaurantId, @Param("userId") Long userId);
}
