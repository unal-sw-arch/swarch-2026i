package com.clickmunch.NotificationService.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateNotificationRequest(
        @NotNull Long userId,
        Long restaurantId,
        @NotBlank String type,
        @NotBlank String title,
        @NotBlank String message,
        Long orderId,
        String telegramChatId  // opcional — si está presente, se envía también a Telegram
) {
    // Constructor de compatibilidad para el código existente que no pasa chatId
    public CreateNotificationRequest(Long userId, Long restaurantId, String type,
                                     String title, String message, Long orderId) {
        this(userId, restaurantId, type, title, message, orderId, null);
    }
}
