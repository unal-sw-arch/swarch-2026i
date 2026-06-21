package com.clickmunch.NotificationService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class NotificationDocsConfig {

    @Bean
    public OpenAPI notificationOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Click & Munch - Notification Service API")
                        .description("Handles notifications and real-time SSE streaming for users")
                        .version("1.0.0"));
    }
}
