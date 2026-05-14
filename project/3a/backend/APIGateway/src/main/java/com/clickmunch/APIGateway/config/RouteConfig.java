package com.clickmunch.APIGateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import com.clickmunch.APIGateway.security.JwtAuthenticationFilter;

/**
 * API Gateway routing (single edge for REST + realtime).
 *
 * Running on the reactive stack (Spring Cloud Gateway Server WebFlux on
 * Netty) so that the HTTP Upgrade handshake required for WebSockets is
 * proxied transparently. Clients — both the web dashboard and the Expo
 * mobile app — reach every backend capability through port 8080:
 *
 *   REST over HTTP
 *     POST /auth/**         -> authservice         (public)
 *     GET|POST /restaurant  -> restaurantservice   (JWT-protected)
 *     GET|POST /menu        -> menuservice         (JWT-protected)
 *     GET|POST /order       -> orderservice        (JWT-protected)
 *     GET|POST /reservation -> reservationservice  (JWT-protected)
 *     GET|POST /checkout    -> checkoutservice     (JWT-protected)
 *     GET|POST /rating      -> ratingservice       (JWT-protected)
 *     GET|POST /notification-> notificationservice (JWT-protected)
 *
 *   STOMP/WebSocket
 *     ws /ws/kitchen        -> orderservice        (JWT carried in STOMP
 *                                                   CONNECT frame, not HTTP)
 *
 * Before migrating to the reactive flavor this project used the servlet
 * flavor (spring-cloud-starter-gateway-server-webmvc) which does not
 * transparently proxy WebSocket upgrades, forcing clients to hit
 * OrderService directly on port 8085. That split edge is no longer
 * necessary — keep microservice ports private to the Docker network and
 * let the gateway be the only public entry point.
 */
@Configuration
public class RouteConfig {

    @Value("${services.auth.url:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${services.restaurant.url:http://localhost:8082}")
    private String restaurantServiceUrl;

    @Value("${services.menu.url:http://localhost:8084}")
    private String menuServiceUrl;

    @Value("${services.order.url:http://localhost:8085}")
    private String orderServiceUrl;

    @Value("${services.reservation.url:http://localhost:8086}")
    private String reservationServiceUrl;

    @Value("${services.checkout.url:http://localhost:8089}")
    private String checkoutServiceUrl;

    @Value("${services.rating.url:http://localhost:8088}")
    private String ratingServiceUrl;

    @Value("${services.notification.url:http://localhost:8087}")
    private String notificationServiceUrl;

    /**
     * Upstream URI for the WebSocket route. Use "ws://..." so the gateway's
     * NettyRoutingFilter switches to WebSocket proxying instead of trying to
     * pipe the Upgrade handshake as a plain HTTP request.
     */
    @Value("${services.order.ws-url:ws://localhost:8085}")
    private String orderServiceWsUrl;

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder, JwtAuthenticationFilter jwtFilter) {
        // PathPattern "/prefix/**" matches both the bare prefix (POST /order)
        // and any subpath (GET /order/restaurant/1), so root POSTs no longer
        // need a "trailing slash" workaround. The list-form path("/x", "/x/**")
        // is equivalent and kept for clarity per resource family.
        //
        // DedupeResponseHeader: downstream services emit their own
        // Access-Control-Allow-Origin / -Credentials headers, and the gateway's
        // CORS filter also adds them (needed for preflight). Without dedup,
        // proxied responses carry the header twice, which the browser rejects.
        final String dedupHeaders = "Access-Control-Allow-Origin Access-Control-Allow-Credentials";
        final String dedupStrategy = "RETAIN_UNIQUE";
        return builder.routes()
                .route("auth", r -> r.path("/auth", "/auth/**")
                        .filters(f -> f
                                .rewritePath("^/auth(/.*)?$", "/api/auth$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy))
                        .uri(authServiceUrl))
                .route("restaurant", r -> r.path("/restaurant", "/restaurant/**")
                        .filters(f -> f
                                .rewritePath("^/restaurant(/.*)?$", "/api/restaurants$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(restaurantServiceUrl))
                .route("menu", r -> r.path("/menu", "/menu/**")
                        .filters(f -> f
                                .rewritePath("^/menu(/.*)?$", "/api/menus$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(menuServiceUrl))
                .route("order", r -> r.path("/order", "/order/**")
                        .filters(f -> f
                                .rewritePath("^/order(/.*)?$", "/api/orders$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(orderServiceUrl))
                .route("reservation", r -> r.path("/reservation", "/reservation/**")
                        .filters(f -> f
                                .rewritePath("^/reservation(/.*)?$", "/api/reservations$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(reservationServiceUrl))
                .route("checkout", r -> r.path("/checkout", "/checkout/**")
                        .filters(f -> f
                                .rewritePath("^/checkout(/.*)?$", "/api/checkout$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(checkoutServiceUrl))
                .route("rating", r -> r.path("/rating", "/rating/**")
                        .filters(f -> f
                                .rewritePath("^/rating(/.*)?$", "/api/ratings$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(ratingServiceUrl))
                .route("notification", r -> r.path("/notification", "/notification/**")
                        .filters(f -> f
                                .rewritePath("^/notification(/.*)?$", "/api/notifications$1")
                                .dedupeResponseHeader(dedupHeaders, dedupStrategy)
                                .filter(jwtFilter))
                        .uri(notificationServiceUrl))
                // WebSocket route. No HTTP-level JWT filter: browsers can't
                // attach an Authorization header to the native WebSocket API,
                // so clients send the token inside the STOMP CONNECT frame
                // (see @stomp/stompjs connectHeaders). The gateway is a dumb
                // byte pipe for the STOMP frames; OrderService validates the
                // CONNECT frame when it implements STOMP-level auth.
                .route("order-ws", r -> r.path("/ws/**")
                        .uri(orderServiceWsUrl))
                .build();
    }

    /**
     * CORS at the gateway level: required so the browser's preflight
     * (OPTIONS) request is answered directly by the gateway. Downstream
     * services (e.g. AuthService) also emit their own Access-Control-*
     * headers, so proxied responses would end up with two copies of
     * {@code Access-Control-Allow-Origin}. The per-route
     * {@code DedupeResponseHeader} filter above collapses that duplication.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.addAllowedOriginPattern("*");
        cors.addAllowedMethod("*");
        cors.addAllowedHeader("*");
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
