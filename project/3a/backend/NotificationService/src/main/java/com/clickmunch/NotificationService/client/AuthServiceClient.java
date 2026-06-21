package com.clickmunch.NotificationService.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Cliente HTTP hacia AuthService.
 * Consulta el telegramChatId de un usuario para que el NotificationEventConsumer
 * pueda forwarded el evento al TelegramWorker sin que el core sepa de Telegram.
 */
@Component
@Slf4j
public class AuthServiceClient {

    private final RestClient restClient;
    private final String authServiceUrl;

    public AuthServiceClient(@Value("${services.auth-url}") String authServiceUrl) {
        this.authServiceUrl = authServiceUrl;
        this.restClient = RestClient.create();
    }

    public String getTelegramChatId(Long userId) {
        try {
            UserInfoProjection response = restClient.get()
                    .uri(authServiceUrl + "/api/auth/users/" + userId)
                    .retrieve()
                    .body(UserInfoProjection.class);

            return (response != null) ? response.telegramChatId() : null;
        } catch (RestClientException e) {
            log.warn("[AuthServiceClient] Could not fetch telegramChatId for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }

    record UserInfoProjection(String telegramChatId) {}
}
