package com.clickmunch.RestaurantService.client;

import com.clickmunch.RestaurantService.dto.AuthUserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class AuthClient {
    private final RestClient restClient;

    public AuthClient(@Value("${auth.service.url}") String authServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(authServiceUrl)
                .build();
    }

    public boolean userExists(Long userId) {
        try {
            restClient.get()
                    .uri("/api/auth/users/{userId}", userId)
                    .retrieve()
                    .toEntity(Void.class);
            return true;
        } catch (RestClientException e) {
            return false;
        }
    }

    public boolean isRestaurantOwner(Long userId) {
        try {
            var response = restClient.get()
                    .uri("/api/auth/users/{userId}", userId)
                    .retrieve()
                    .body(UserResponse.class);

            return response != null && "RESTAURANT_MANAGER".equals(response.role);
        } catch (RestClientException e) {
            return false;
        }
    }
    public record UserResponse(Long id, String username, String role) {}

    public AuthUserResponse getUserDetails(Long userId) {
        try {

            return restClient.get()
                    .uri("/api/auth/users/{userId}", userId)
                    .retrieve()
                    .body(AuthUserResponse.class);
        } catch (RestClientException e) {
            return null;
        }
    }

}
