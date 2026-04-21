package com.clickmunch.OrderService.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over WebSocket setup for pushing kitchen events to chef clients.
 *
 * Endpoint: /ws/kitchen
 *   - Reached from clients at ws://<gateway-host>:8080/ws/kitchen — the
 *     API Gateway (Spring Cloud Gateway on WebFlux/Netty) proxies the
 *     HTTP Upgrade handshake to ws://orderservice:8085/ws/kitchen.
 *   - Reached service-to-service at ws://orderservice:8085/ws/kitchen
 *     (internal Docker network only; not published to the host).
 *
 * Topics:
 *   /topic/kitchen/{restaurantId}  - ORDER_CREATED, ORDER_STATUS_CHANGED
 *     events scoped to a single restaurant so chefs only see their
 *     kitchen.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker for /topic/** fan-out (sufficient for a single
        // OrderService replica; switch to RabbitMQ/ActiveMQ relay if we scale out).
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/kitchen")
                .setAllowedOriginPatterns("*");
        // SockJS fallback is intentionally omitted: the gateway proxies a raw
        // WebSocket upgrade; clients use @stomp/stompjs with a ws:// URL.
    }
}
