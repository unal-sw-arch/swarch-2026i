package com.clickmunch.NotificationService.repository;

import com.clickmunch.NotificationService.entity.Notification;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends ListCrudRepository<Notification, Long> {

    @Query("SELECT * FROM notifications WHERE user_id = :userId ORDER BY created_at DESC")
    List<Notification> findByUserId(@Param("userId") Long userId);

    @Query("SELECT * FROM notifications WHERE user_id = :userId AND read = false ORDER BY created_at DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT * FROM notifications WHERE restaurant_id = :restaurantId ORDER BY created_at DESC")
    List<Notification> findByRestaurantId(@Param("restaurantId") Long restaurantId);

    @Query("SELECT COUNT(*) FROM notifications WHERE user_id = :userId AND read = false")
    Long countUnreadByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE notifications SET read = true WHERE user_id = :userId AND read = false")
    void markAllAsReadByUserId(@Param("userId") Long userId);
}
