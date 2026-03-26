package com.clickmunch.AuthService.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthDocsConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info(). title("ClickAndMunch: Auth Service")
                        .description("Auth Service for the ClickAndMunch application. " +
                                "Handles user registration, login and permissions.")
                        .version("0.1"));
    }
}
