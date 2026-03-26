package com.clickmunch.RestaurantService.controller;

import com.clickmunch.RestaurantService.client.AuthClient;
import com.clickmunch.RestaurantService.dto.CreateRestaurantRequest;
import com.clickmunch.RestaurantService.dto.NearbySearchRequest;
import com.clickmunch.RestaurantService.dto.RestaurantDetailsResponse;
import com.clickmunch.RestaurantService.dto.RestaurantResponse;
import com.clickmunch.RestaurantService.entity.Restaurant;
import com.clickmunch.RestaurantService.service.RestaurantService;

import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final AuthClient authClient;

    public RestaurantController(RestaurantService restaurantService, AuthClient authClient) {
        this.restaurantService = restaurantService;
        this.authClient = authClient;
    }

    @PostMapping
    public RestaurantResponse createRestaurant(@RequestBody CreateRestaurantRequest createRestaurantRequest) {
        return restaurantService.createRestaurant(createRestaurantRequest);
    }

    @GetMapping("/{id}")
    public RestaurantResponse getRestaurant(@PathVariable Long id) {
        return restaurantService.getRestaurant(id);
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByOwnerId(@PathVariable Long ownerId) {
        var authUser = authClient.getUserDetails(ownerId);
        if (authUser == null) {
            return ResponseEntity.status(404).build();
        }
        var restaurants = restaurantService.listByOwnerId(ownerId);
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<RestaurantResponse>> getNearbyRestaurants(
            @RequestBody NearbySearchRequest nearbySearchRequest) {
        var restaurants = restaurantService.findNearby(
                nearbySearchRequest.latitude(),
                nearbySearchRequest.longitude(),
                nearbySearchRequest.radiusInKm());
        return ResponseEntity.ok(restaurants);
    }

    @GetMapping("/{id}/details" )
    public ResponseEntity<RestaurantDetailsResponse> getRestaurantDetails(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getRestaurantDetails(id));
    }

}
