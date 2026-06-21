package com.clickmunch.NotificationService.event;

import com.clickmunch.NotificationService.config.RabbitMQConfig;
import com.clickmunch.NotificationService.config.TelegramProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Worker — el único componente del sistema que conoce la API de Telegram.
 *
 * Responsabilidades:
 *   1. Consumir mensajes de la cola de Telegram en RabbitMQ.
 *   2. Transformar el evento genérico al formato requerido por la API de Telegram.
 *   3. Ejecutar el HTTP POST hacia api.telegram.org.
 *   4. Manejar errores de la API externa sin propagar al broker.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramWorker {

    private final TelegramProperties telegramProperties;
    private final RestClient restClient = RestClient.create();

    @RabbitListener(queues = RabbitMQConfig.TELEGRAM_QUEUE)
    public void handleTelegramNotification(TelegramNotificationEvent event) {
        log.info("[TelegramWorker] Processing event — type: {}, origin: {}, chatId: {}",
                event.eventType(), event.originService(), event.chatId());

        try {
            sendToTelegram(event.chatId(), event.message());
        } catch (TelegramApiException e) {
            // Log y absorbe el error: el broker no debe reencolar por fallas externas
            log.error("[TelegramWorker] Telegram API error for chatId {}: {}", event.chatId(), e.getMessage());
        } catch (Exception e) {
            log.error("[TelegramWorker] Unexpected error processing event: {}", e.getMessage(), e);
        }
    }

    private void sendToTelegram(String chatId, String text) {
        String url = telegramProperties.getApiBaseUrl()
                + "/bot" + telegramProperties.getBotToken()
                + "/sendMessage";

        Map<String, String> payload = Map.of(
                "chat_id", chatId,
                "text", text,
                "parse_mode", "HTML"
        );

        restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(payload)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    throw new TelegramApiException(
                            "Telegram returned HTTP " + response.getStatusCode()
                            + " for chatId " + chatId
                    );
                })
                .toBodilessEntity();

        log.info("[TelegramWorker] Message delivered to Telegram — chatId: {}", chatId);
    }

    // Excepción interna para errores de la API externa
    static class TelegramApiException extends RuntimeException {
        TelegramApiException(String message) {
            super(message);
        }
    }
}
