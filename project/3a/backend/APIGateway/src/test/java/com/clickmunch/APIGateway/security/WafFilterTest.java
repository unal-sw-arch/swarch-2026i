package com.clickmunch.APIGateway.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.util.concurrent.atomic.AtomicBoolean;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Unit tests for {@link WafFilter}. They exercise the screening logic directly
 * with mock reactive requests — no Spring context or network is needed.
 */
class WafFilterTest {

    private final WafFilter waf = new WafFilter();

    private boolean isBlocked(MockServerHttpRequest request) {
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        AtomicBoolean forwarded = new AtomicBoolean(false);
        GatewayFilterChain chain = ex -> {
            forwarded.set(true);
            return Mono.empty();
        };
        waf.filter(exchange, chain).block();
        boolean blocked = exchange.getResponse().getStatusCode() == HttpStatus.FORBIDDEN;
        // A blocked request must NOT be forwarded downstream.
        if (blocked) {
            assertThat(forwarded).isFalse();
        }
        return blocked;
    }

    @Test
    @DisplayName("Allows a clean request and forwards it downstream")
    void allowsCleanRequest() {
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/menu").queryParam("restaurantId", "1001").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean forwarded = new AtomicBoolean(false);
        GatewayFilterChain chain = ex -> {
            forwarded.set(true);
            return Mono.empty();
        };
        waf.filter(exchange, chain).block();

        assertThat(forwarded).isTrue();
        assertThat(exchange.getResponse().getStatusCode()).isNotEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Allows a normal resource path with numeric id")
    void allowsNormalPath() {
        assertThat(isBlocked(MockServerHttpRequest.get("/order/12345").build())).isFalse();
    }

    @Test
    @DisplayName("Blocks SQL injection via UNION SELECT in query")
    void blocksUnionSelect() {
        assertThat(isBlocked(MockServerHttpRequest
                .get("/menu").queryParam("q", "1 UNION SELECT password FROM users").build())).isTrue();
    }

    @Test
    @DisplayName("Blocks classic OR 1=1 tautology")
    void blocksOrTautology() {
        assertThat(isBlocked(MockServerHttpRequest
                .get("/restaurant").queryParam("id", "5 OR 1=1").build())).isTrue();
    }

    @Test
    @DisplayName("Blocks XSS <script> payload in query")
    void blocksScriptTag() {
        assertThat(isBlocked(MockServerHttpRequest
                .get("/menu").queryParam("q", "<script>alert(1)</script>").build())).isTrue();
    }

    @Test
    @DisplayName("Blocks javascript: scheme XSS")
    void blocksJavascriptScheme() {
        assertThat(isBlocked(MockServerHttpRequest
                .get("/menu").queryParam("next", "javascript:alert(document.cookie)").build())).isTrue();
    }

    @Test
    @DisplayName("Blocks path traversal in query parameter")
    void blocksPathTraversal() {
        assertThat(isBlocked(MockServerHttpRequest
                .get("/menu").queryParam("file", "../../etc/passwd").build())).isTrue();
    }

    @Test
    @DisplayName("Blocks attack hidden by double URL-encoding")
    void blocksDoubleEncodedTraversal() {
        // %252e%252e%252f decodes twice to ../ — evasion of naive single-decode filters.
        // Built from a raw URI so the encoding is preserved exactly (queryParam would re-encode it).
        MockServerHttpRequest request = MockServerHttpRequest
                .method(HttpMethod.GET, URI.create("/menu?file=%252e%252e%252fetc/passwd")).build();
        assertThat(isBlocked(request)).isTrue();
    }

    @Test
    @DisplayName("Blocks injection delivered through the Referer header")
    void blocksMaliciousHeader() {
        assertThat(isBlocked(MockServerHttpRequest
                .get("/menu")
                .header("Referer", "http://evil.test/<script>alert(1)</script>")
                .build())).isTrue();
    }

    @Test
    @DisplayName("Lets CORS preflight (OPTIONS) through without screening")
    void allowsOptionsPreflight() {
        MockServerHttpRequest request = MockServerHttpRequest
                .options("/menu").queryParam("q", "<script>").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean forwarded = new AtomicBoolean(false);
        GatewayFilterChain chain = ex -> {
            forwarded.set(true);
            return Mono.empty();
        };
        waf.filter(exchange, chain).block();

        assertThat(forwarded).isTrue();
    }
}
