package com.clickmunch.RatingService.dto;

public record RatingSummary(
        Long entityId,
        Double averageScore,
        Long totalRatings
) {}
