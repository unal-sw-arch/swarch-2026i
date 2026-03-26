package com.clickmunch.APIGateway.security;

import org.springframework.web.servlet.function.HandlerFilterFunction;
import org.springframework.web.servlet.function.HandlerFunction;
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;

public class JwtAuthenticationFilter implements HandlerFilterFunction<ServerResponse, ServerResponse> {
    private final JwtTokenUtil jwtTokenUtil;
    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil) {
        this.jwtTokenUtil = jwtTokenUtil;
    }
    @Override
    public ServerResponse filter(ServerRequest request, HandlerFunction<ServerResponse> responseHandlerFunction) throws Exception {
        String authHeader = request.headers().header("Authorization").stream().findFirst().orElse(null);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtTokenUtil.isTokenValid(token)) {
                return responseHandlerFunction.handle(request);
            }
        }
        return ServerResponse.status(401).build();
    }
}
