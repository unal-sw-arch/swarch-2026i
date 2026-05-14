package com.clickmunch.RatingService.service;

import com.clickmunch.RatingService.dto.*;
import com.clickmunch.RatingService.entity.RestaurantRating;
import com.clickmunch.RatingService.entity.WaiterRating;
import com.clickmunch.RatingService.repository.RestaurantRatingRepository;
import com.clickmunch.RatingService.repository.WaiterRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RestaurantRatingRepository restaurantRatingRepository;
    private final WaiterRatingRepository waiterRatingRepository;

    @Transactional
    public RestaurantRatingResponse createRestaurantRating(CreateRestaurantRatingRequest request) {
        RestaurantRating rating = RestaurantRating.builder()
                .customerId(request.customerId())
                .customerName(request.customerName())
                .restaurantId(request.restaurantId())
                .restaurantName(request.restaurantName())
                .orderId(request.orderId())
                .score(request.score())
                .review(request.review())
                .createdAt(LocalDateTime.now())
                .build();
        RestaurantRating saved = restaurantRatingRepository.save(rating);
        return toRestaurantResponse(saved);
    }

    public List<RestaurantRatingResponse> getRatingsByRestaurant(Long restaurantId) {
        return restaurantRatingRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toRestaurantResponse).toList();
    }

    public List<RestaurantRatingResponse> getRatingsByCustomer(Long customerId) {
        return restaurantRatingRepository.findByCustomerId(customerId).stream()
                .map(this::toRestaurantResponse).toList();
    }

    public RatingSummary getRestaurantSummary(Long restaurantId) {
        Double avg = restaurantRatingRepository.getAverageScoreByRestaurantId(restaurantId);
        Long count = restaurantRatingRepository.countByRestaurantId(restaurantId);
        return new RatingSummary(restaurantId, avg != null ? avg : 0.0, count);
    }

    @Transactional
    public WaiterRatingResponse createWaiterRating(CreateWaiterRatingRequest request) {
        WaiterRating rating = WaiterRating.builder()
                .customerId(request.customerId())
                .customerName(request.customerName())
                .waiterId(request.waiterId())
                .waiterName(request.waiterName())
                .restaurantId(request.restaurantId())
                .orderId(request.orderId())
                .score(request.score())
                .comment(request.comment())
                .createdAt(LocalDateTime.now())
                .build();
        WaiterRating saved = waiterRatingRepository.save(rating);
        return toWaiterResponse(saved);
    }

    public List<WaiterRatingResponse> getRatingsByWaiter(Long waiterId) {
        return waiterRatingRepository.findByWaiterId(waiterId).stream()
                .map(this::toWaiterResponse).toList();
    }

    public List<WaiterRatingResponse> getWaiterRatingsByRestaurant(Long restaurantId) {
        return waiterRatingRepository.findByRestaurantId(restaurantId).stream()
                .map(this::toWaiterResponse).toList();
    }

    public RatingSummary getWaiterSummary(Long waiterId) {
        Double avg = waiterRatingRepository.getAverageScoreByWaiterId(waiterId);
        Long count = waiterRatingRepository.countByWaiterId(waiterId);
        return new RatingSummary(waiterId, avg != null ? avg : 0.0, count);
    }

    @Transactional
    public void deleteRating(Long id) {
        restaurantRatingRepository.deleteById(id);
    }

    @Transactional
    public void deleteWaiterRating(Long id) {
        waiterRatingRepository.deleteById(id);
    }

    private RestaurantRatingResponse toRestaurantResponse(RestaurantRating r) {
        return new RestaurantRatingResponse(
                r.getId(), r.getCustomerId(), r.getCustomerName(),
                r.getRestaurantId(), r.getRestaurantName(), r.getOrderId(),
                r.getScore(), r.getReview(), r.getCreatedAt()
        );
    }

    private WaiterRatingResponse toWaiterResponse(WaiterRating r) {
        return new WaiterRatingResponse(
                r.getId(), r.getCustomerId(), r.getCustomerName(),
                r.getWaiterId(), r.getWaiterName(), r.getRestaurantId(),
                r.getOrderId(), r.getScore(), r.getComment(), r.getCreatedAt()
        );
    }
}
