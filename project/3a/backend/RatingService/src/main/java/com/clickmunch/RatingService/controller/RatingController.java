package com.clickmunch.RatingService.controller;

import com.clickmunch.RatingService.dto.*;
import com.clickmunch.RatingService.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // --- Restaurant Ratings ---

    @PostMapping("/restaurant")
    public ResponseEntity<RestaurantRatingResponse> createRestaurantRating(
            @Valid @RequestBody CreateRestaurantRatingRequest request) {
        RestaurantRatingResponse response = ratingService.createRestaurantRating(request);
        return ResponseEntity.created(URI.create("/api/ratings/restaurant/" + response.id())).body(response);
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<RestaurantRatingResponse>> getRestaurantRatings(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(ratingService.getRatingsByRestaurant(restaurantId));
    }

    @GetMapping("/restaurant/{restaurantId}/summary")
    public ResponseEntity<RatingSummary> getRestaurantSummary(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(ratingService.getRestaurantSummary(restaurantId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RestaurantRatingResponse>> getCustomerRatings(
            @PathVariable Long customerId) {
        return ResponseEntity.ok(ratingService.getRatingsByCustomer(customerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable Long id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }

    // --- Waiter Ratings ---

    @PostMapping("/waiter")
    public ResponseEntity<WaiterRatingResponse> createWaiterRating(
            @Valid @RequestBody CreateWaiterRatingRequest request) {
        WaiterRatingResponse response = ratingService.createWaiterRating(request);
        return ResponseEntity.created(URI.create("/api/ratings/waiter/" + response.id())).body(response);
    }

    @GetMapping("/waiter/{waiterId}")
    public ResponseEntity<List<WaiterRatingResponse>> getWaiterRatings(@PathVariable Long waiterId) {
        return ResponseEntity.ok(ratingService.getRatingsByWaiter(waiterId));
    }

    @GetMapping("/waiter/{waiterId}/summary")
    public ResponseEntity<RatingSummary> getWaiterSummary(@PathVariable Long waiterId) {
        return ResponseEntity.ok(ratingService.getWaiterSummary(waiterId));
    }

    @GetMapping("/waiter/restaurant/{restaurantId}")
    public ResponseEntity<List<WaiterRatingResponse>> getWaiterRatingsByRestaurant(
            @PathVariable Long restaurantId) {
        return ResponseEntity.ok(ratingService.getWaiterRatingsByRestaurant(restaurantId));
    }

    @DeleteMapping("/waiter/{id}")
    public ResponseEntity<Void> deleteWaiterRating(@PathVariable Long id) {
        ratingService.deleteWaiterRating(id);
        return ResponseEntity.noContent().build();
    }
}
