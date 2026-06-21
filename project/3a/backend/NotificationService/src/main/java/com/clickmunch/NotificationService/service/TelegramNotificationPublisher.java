package com.clickmunch.NotificationService.service;

import com.clickmunch.NotificationService.config.RabbitMQConfig;
import com.clickmunch.NotificationService.event.TelegramNotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * Emisor (Sistema Core).
 * Publica un comando de notificación en el Exchange de forma abstracta.
 * No contiene ninguna referencia a Telegram, HTTP, ni tokens de bot.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramNotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void sendNotification(String chatId, String message, String originService, String eventType) {
        TelegramNotificationEvent event = new TelegramNotificationEvent(chatId, message, originService, eventType);

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_NAME,
                RabbitMQConfig.TELEGRAM_ROUTING_KEY,
                event
        );

        log.info("[Publisher] Notification queued — origin: {}, event: {}, chatId: {}", originService, eventType, chatId);
    }
}
