package com.clickmunch.RestaurantService.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RestaurantDocsConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info(). title("ClickAndMunch: Restaurant Service")
                        .description("Restaurant Service for the ClickAndMunch application. " +
                                "Handles restaurant functionalities and restaurant ownership.")
                        .version("0.1"));
    }
}