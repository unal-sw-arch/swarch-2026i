package com.clickmunch.ReservationService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class ReservationDocsConfig {

    @Bean
    public OpenAPI reservationOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Click & Munch - Reservation Service API")
                        .description("Manages restaurant reservations, party sizes, scheduling, and order linking")
                        .version("1.0.0"));
    }
}
