package com.clickmunch.APIGateway.security;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

/**
 * Application-layer Web Application Firewall (WAF) for the API Gateway.
 *
 * <p>Implemented as a high-precedence {@link GlobalFilter} so every proxied
 * request is screened <b>before</b> routing and before the per-route JWT
 * filter. Requests whose path, query string, or common headers match known
 * SQL-injection, cross-site-scripting (XSS), or path-traversal signatures are
 * rejected with HTTP 403 and never reach a downstream service.
 *
 * <h2>Why an embedded gateway filter instead of NGINX + ModSecurity?</h2>
 * <ul>
 *   <li><b>Cohesion / no extra infra:</b> the WAF lives inside the single
 *       public entry point (the gateway). No additional container, image, or
 *       network hop to deploy, secure, and keep healthy.</li>
 *   <li><b>Integrates with the existing reactive chain:</b> it runs ahead of
 *       the JWT {@code GatewayFilter}, so malicious traffic is dropped before
 *       any auth or proxying work happens.</li>
 *   <li><b>Testable:</b> pure unit tests, no sidecar required.</li>
 * </ul>
 *
 * <p>Request <b>bodies are intentionally not scanned here</b>: this is a JSON
 * API whose bodies legitimately carry arbitrary text (passwords, free-text
 * notes) that would trigger false positives, while SQL access downstream is
 * parameterized (Spring Data) and responses are JSON-encoded. Deep body
 * inspection is the job of a dedicated network WAF (NGINX + OWASP ModSecurity
 * Core Rule Set) placed in front of the gateway; it can be layered in later
 * without changing application code. See SYSTEM_STATUS.md for that option.
 */
@Component
public class WafFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(WafFilter.class);

    /** Header values worth screening (classic reflected-injection vectors). */
    private static final List<String> SCREENED_HEADERS = List.of(
            HttpHeaders.REFERER,
            HttpHeaders.ORIGIN,
            "X-Forwarded-For",
            "X-Forwarded-Host");

    private static final List<Pattern> SQL_INJECTION = List.of(
            Pattern.compile("(?i)\\b(union\\s+select|select\\s+.+\\s+from\\s+|insert\\s+into\\s+|update\\s+.+\\s+set\\s+|delete\\s+from\\s+|drop\\s+(table|database)|truncate\\s+table|alter\\s+table)"),
            Pattern.compile("(?i)\\b(or|and)\\b\\s+['\"]?\\d+['\"]?\\s*=\\s*['\"]?\\d+"),
            Pattern.compile("(?i)(;|--|#|/\\*|\\*/)\\s*(drop|select|insert|update|delete|union)\\b"),
            Pattern.compile("(?i)\\b(sleep|benchmark|pg_sleep|load_file|information_schema)\\s*\\(?"),
            Pattern.compile("(?i)'\\s*(or|and)\\s*'"));

    private static final List<Pattern> XSS = List.of(
            Pattern.compile("(?i)<\\s*script"),
            Pattern.compile("(?i)<\\s*/?\\s*(iframe|img|svg|object|embed|body|video|audio|link|style)\\b"),
            Pattern.compile("(?i)javascript\\s*:"),
            Pattern.compile("(?i)\\bon(error|load|click|mouseover|focus|submit|toggle)\\s*="),
            Pattern.compile("(?i)(document\\.cookie|document\\.location|window\\.location|eval\\s*\\(|alert\\s*\\()"));

    private static final List<Pattern> PATH_TRAVERSAL = List.of(
            Pattern.compile("(\\.\\./|\\.\\.\\\\)"),
            Pattern.compile("(?i)(/etc/passwd|/etc/shadow|c:\\\\windows|boot\\.ini)"),
            Pattern.compile("\\x00"));

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // CORS preflight carries no exploitable payload; let it through so the
        // gateway's CORS handling is not disturbed.
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return chain.filter(exchange);
        }

        String hit = firstMatch(safeDecode(request.getPath().value()));
        if (hit == null) {
            hit = firstMatch(safeDecode(request.getURI().getRawQuery()));
        }
        if (hit == null) {
            hit = screenHeaders(request.getHeaders());
        }

        if (hit != null) {
            logger.warn("WAF blocked request: method={} path={} clientIp={} rule={}",
                    request.getMethod(), request.getPath().value(), clientIp(request), hit);
            return reject(exchange);
        }
        return chain.filter(exchange);
    }

    private String screenHeaders(HttpHeaders headers) {
        for (String name : SCREENED_HEADERS) {
            List<String> values = headers.get(name);
            if (values == null) {
                continue;
            }
            for (String value : values) {
                String hit = firstMatch(safeDecode(value));
                if (hit != null) {
                    return hit + " (header:" + name + ")";
                }
            }
        }
        return null;
    }

    /** @return a short rule id if the value matches an attack signature, else {@code null}. */
    private String firstMatch(String value) {
        if (value == null || value.isEmpty()) {
            return null;
        }
        for (Pattern p : SQL_INJECTION) {
            if (p.matcher(value).find()) {
                return "SQLI";
            }
        }
        for (Pattern p : XSS) {
            if (p.matcher(value).find()) {
                return "XSS";
            }
        }
        for (Pattern p : PATH_TRAVERSAL) {
            if (p.matcher(value).find()) {
                return "PATH_TRAVERSAL";
            }
        }
        return null;
    }

    /** Decode up to two passes to defeat single/double percent-encoding evasion. */
    private String safeDecode(String value) {
        if (value == null) {
            return null;
        }
        String decoded = value;
        for (int i = 0; i < 2; i++) {
            try {
                String next = URLDecoder.decode(decoded, StandardCharsets.UTF_8);
                if (next.equals(decoded)) {
                    break;
                }
                decoded = next;
            } catch (IllegalArgumentException ex) {
                break; // malformed encoding; screen what we already have
            }
        }
        return decoded;
    }

    private String clientIp(ServerHttpRequest request) {
        String xff = request.getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddress() != null && request.getRemoteAddress().getAddress() != null
                ? request.getRemoteAddress().getAddress().getHostAddress()
                : "unknown";
    }

    private Mono<Void> reject(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.FORBIDDEN);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = "{\"error\":\"Forbidden\",\"message\":\"Request blocked by WAF\"}"
                .getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(body);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
