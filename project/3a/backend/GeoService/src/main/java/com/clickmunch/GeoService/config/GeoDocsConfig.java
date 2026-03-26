package com.clickmunch.GeoService.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeoDocsConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info(). title("ClickAndMunch: Geo Service")
                        .description("Geo Service for the ClickAndMunch application. " +
                                "Handles various location functionalities.")
                        .version("0.1"));
    }
}
