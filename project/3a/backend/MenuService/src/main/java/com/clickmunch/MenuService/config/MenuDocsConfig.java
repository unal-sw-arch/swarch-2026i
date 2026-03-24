package com.clickmunch.MenuService.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MenuDocsConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info(). title("ClickAndMunch: Menu Service")
                        .description("Menu Service for the ClickAndMunch application. " +
                                "Handles menu items and menu categories.")
                        .version("0.1"));
    }
}
