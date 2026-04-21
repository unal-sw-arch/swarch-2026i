package com.clickmunch.NotificationService.service;

import com.clickmunch.NotificationService.dto.CreateNotificationRequest;
import com.clickmunch.NotificationService.dto.NotificationResponse;
import com.clickmunch.NotificationService.entity.Notification;
import com.clickmunch.NotificationService.entity.NotificationType;
import com.clickmunch.NotificationService.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final Map<Long, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.userId())
                .restaurantId(request.restaurantId())
                .type(NotificationType.valueOf(request.type()))
                .title(request.title())
                .message(request.message())
                .read(false)
                .orderId(request.orderId())
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        // Push to SSE subscribers
        sendToUser(request.userId(), response);

        return response;
    }

    public List<NotificationResponse> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::toResponse).toList();
    }

    public List<NotificationResponse> getUnreadByUser(Long userId) {
        return notificationRepository.findUnreadByUserId(userId).stream()
                .map(this::toResponse).toList();
    }

    public List<NotificationResponse> getNotificationsByRestaurant(Long restaurantId) {
        return notificationRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toResponse).toList();
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + id));
        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);
        return toResponse(saved);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    // --- SSE (Server-Sent Events) for real-time ---

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));

        return emitter;
    }

    private void sendToUser(Long userId, NotificationResponse notification) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters == null) return;

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
            } catch (IOException e) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
            }
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getUserId(), n.getRestaurantId(),
                n.getType().name(), n.getTitle(), n.getMessage(),
                n.getRead(), n.getOrderId(), n.getCreatedAt()
        );
    }
}
