package com.clickmunch.NotificationService.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Data
@Component
@ConfigurationProperties(prefix = "telegram")
public class TelegramProperties {
    private String botToken;
    private String apiBaseUrl = "https://api.telegram.org";
}
