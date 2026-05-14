package com.clickmunch.OrderService.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrderDocsConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info().title("ClickAndMunch: Order Service")
                        .description("Order Service for the ClickAndMunch application. " +
                                "Manages the full order lifecycle from placement through kitchen preparation to delivery.")
                        .version("0.1"));
    }
}
