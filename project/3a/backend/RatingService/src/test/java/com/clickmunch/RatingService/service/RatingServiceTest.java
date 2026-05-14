package com.clickmunch.RatingService.service;

import com.clickmunch.RatingService.dto.*;
import com.clickmunch.RatingService.entity.RestaurantRating;
import com.clickmunch.RatingService.entity.WaiterRating;
import com.clickmunch.RatingService.repository.RestaurantRatingRepository;
import com.clickmunch.RatingService.repository.WaiterRatingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RestaurantRatingRepository restaurantRatingRepository;

    @Mock
    private WaiterRatingRepository waiterRatingRepository;

    @InjectMocks
    private RatingService ratingService;

    @Test
    void createRestaurantRating_shouldSaveAndReturn() {
        CreateRestaurantRatingRequest request = new CreateRestaurantRatingRequest(
                1L, "John", 10L, "La Parrilla", 100L, 5, "Great food!"
        );

        RestaurantRating saved = RestaurantRating.builder()
                .id(1L).customerId(1L).customerName("John")
                .restaurantId(10L).restaurantName("La Parrilla")
                .orderId(100L).score(5).review("Great food!")
                .createdAt(LocalDateTime.now()).build();

        when(restaurantRatingRepository.save(any())).thenReturn(saved);

        RestaurantRatingResponse response = ratingService.createRestaurantRating(request);

        assertEquals(1L, response.id());
        assertEquals(5, response.score());
        assertEquals("Great food!", response.review());
        verify(restaurantRatingRepository).save(any());
    }

    @Test
    void getRestaurantSummary_shouldReturnAverageAndCount() {
        when(restaurantRatingRepository.getAverageScoreByRestaurantId(10L)).thenReturn(4.5);
        when(restaurantRatingRepository.countByRestaurantId(10L)).thenReturn(20L);

        RatingSummary summary = ratingService.getRestaurantSummary(10L);

        assertEquals(10L, summary.entityId());
        assertEquals(4.5, summary.averageScore());
        assertEquals(20L, summary.totalRatings());
    }

    @Test
    void getRestaurantSummary_noRatings_shouldReturnZeros() {
        when(restaurantRatingRepository.getAverageScoreByRestaurantId(99L)).thenReturn(null);
        when(restaurantRatingRepository.countByRestaurantId(99L)).thenReturn(0L);

        RatingSummary summary = ratingService.getRestaurantSummary(99L);

        assertEquals(0.0, summary.averageScore());
        assertEquals(0L, summary.totalRatings());
    }

    @Test
    void createWaiterRating_shouldSaveAndReturn() {
        CreateWaiterRatingRequest request = new CreateWaiterRatingRequest(
                1L, "John", 5L, "Maria", 10L, 100L, 4, "Very attentive"
        );

        WaiterRating saved = WaiterRating.builder()
                .id(1L).customerId(1L).customerName("John")
                .waiterId(5L).waiterName("Maria").restaurantId(10L)
                .orderId(100L).score(4).comment("Very attentive")
                .createdAt(LocalDateTime.now()).build();

        when(waiterRatingRepository.save(any())).thenReturn(saved);

        WaiterRatingResponse response = ratingService.createWaiterRating(request);

        assertEquals(1L, response.id());
        assertEquals(4, response.score());
        assertEquals("Very attentive", response.comment());
        verify(waiterRatingRepository).save(any());
    }

    @Test
    void getWaiterSummary_shouldReturnAverageAndCount() {
        when(waiterRatingRepository.getAverageScoreByWaiterId(5L)).thenReturn(4.8);
        when(waiterRatingRepository.countByWaiterId(5L)).thenReturn(15L);

        RatingSummary summary = ratingService.getWaiterSummary(5L);

        assertEquals(5L, summary.entityId());
        assertEquals(4.8, summary.averageScore());
        assertEquals(15L, summary.totalRatings());
    }
}
