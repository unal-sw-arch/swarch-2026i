package com.clickmunch.NotificationService.event;

import java.io.Serializable;

/**
 * Evento genérico de notificación hacia canales externos.
 * El emisor no sabe que el destino es Telegram — solo declara
 * "quiero enviar este mensaje a este chat".
 */
public record TelegramNotificationEvent(
        String chatId,
        String message,
        String originService,
        String eventType
) implements Serializable {}
