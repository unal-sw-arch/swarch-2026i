package com.clickmunch.APIGateway.config;

import org.springframework.beans.factory.annotation.Value;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.rewritePath;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import static org.springframework.web.servlet.function.RequestPredicates.path;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import com.clickmunch.APIGateway.security.JwtAuthenticationFilter;
import com.clickmunch.APIGateway.security.JwtTokenUtil;


@Configuration
public class RouteConfig {

    @Value("${services.auth.url:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${services.restaurant.url:http://localhost:8082}")
    private String restaurantServiceUrl;

    @Value("${services.menu.url:http://localhost:8084}")
    private String menuServiceUrl;

    @Bean
    public RouterFunction<ServerResponse> routes(JwtTokenUtil jwtTokenUtil) {
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtTokenUtil);

        RouterFunction<ServerResponse> auth = route("auth")
                .route(path("/auth/**"), http())
                .before(uri(authServiceUrl))
                .before(rewritePath("/auth/(?<segment>.*)", "/api/auth/${segment}"))
                .build();
        RouterFunction<ServerResponse> restaurant = route("restaurant")
                .route(path("/restaurant/**"), http())
                .before(uri(restaurantServiceUrl))
                .before(rewritePath("/restaurant/(?<segment>.*)", "/api/restaurants/${segment}"))
                .filter(jwtAuthenticationFilter)
                .build();
        RouterFunction<ServerResponse> menu = route("menu")
                .route(path("/menu/**"), http())
                .before(uri(menuServiceUrl))
                .before(rewritePath("/menu/(?<segment>.*)", "/api/menus/${segment}"))
                .filter(jwtAuthenticationFilter)
                .build();
        return auth.and(restaurant).and(menu);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }


}
