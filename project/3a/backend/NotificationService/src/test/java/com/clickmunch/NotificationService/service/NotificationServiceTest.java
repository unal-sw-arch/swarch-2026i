package com.clickmunch.NotificationService.service;

import com.clickmunch.NotificationService.dto.CreateNotificationRequest;
import com.clickmunch.NotificationService.dto.NotificationResponse;
import com.clickmunch.NotificationService.entity.Notification;
import com.clickmunch.NotificationService.entity.NotificationType;
import com.clickmunch.NotificationService.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void createNotification_shouldSaveAndReturn() {
        CreateNotificationRequest request = new CreateNotificationRequest(
                1L, 10L, "ORDER_READY", "Order Ready", "Your order #42 is ready!", 42L
        );

        Notification saved = Notification.builder()
                .id(1L).userId(1L).restaurantId(10L)
                .type(NotificationType.ORDER_READY).title("Order Ready")
                .message("Your order #42 is ready!").read(false)
                .orderId(42L).createdAt(LocalDateTime.now()).build();

        when(notificationRepository.save(any())).thenReturn(saved);

        NotificationResponse response = notificationService.createNotification(request);

        assertEquals(1L, response.id());
        assertEquals("ORDER_READY", response.type());
        assertFalse(response.read());
        verify(notificationRepository).save(any());
    }

    @Test
    void markAsRead_shouldUpdateAndReturn() {
        Notification notification = Notification.builder()
                .id(1L).userId(1L).type(NotificationType.ORDER_READY)
                .title("Test").message("Test").read(false)
                .createdAt(LocalDateTime.now()).build();

        Notification updated = Notification.builder()
                .id(1L).userId(1L).type(NotificationType.ORDER_READY)
                .title("Test").message("Test").read(true)
                .createdAt(notification.getCreatedAt()).build();

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any())).thenReturn(updated);

        NotificationResponse response = notificationService.markAsRead(1L);

        assertTrue(response.read());
        verify(notificationRepository).save(any());
    }

    @Test
    void getUnreadCount_shouldReturnCount() {
        when(notificationRepository.countUnreadByUserId(1L)).thenReturn(5L);

        Long count = notificationService.getUnreadCount(1L);

        assertEquals(5L, count);
    }

    @Test
    void getUnreadByUser_shouldReturnUnreadOnly() {
        Notification n1 = Notification.builder()
                .id(1L).userId(1L).type(NotificationType.WAITER_CALL)
                .title("Call").message("Table needs help").read(false)
                .createdAt(LocalDateTime.now()).build();

        when(notificationRepository.findUnreadByUserId(1L)).thenReturn(List.of(n1));

        List<NotificationResponse> results = notificationService.getUnreadByUser(1L);

        assertEquals(1, results.size());
        assertFalse(results.getFirst().read());
    }
}
