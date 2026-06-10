package com.clickmunch.RatingService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class RatingDocsConfig {

    @Bean
    public OpenAPI ratingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Click & Munch - Rating Service API")
                        .description("Handles restaurant and waiter ratings/reviews")
                        .version("1.0.0"));
    }
}
