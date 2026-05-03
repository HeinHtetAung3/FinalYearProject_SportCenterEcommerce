package com.sportsecommerce.service;

import com.sportsecommerce.dto.CommerceDtos;

import java.util.List;

public interface ReviewService {
    /** Total reviews in the system (storefront aggregates). */
    long countAll();

    /**
     * Mean star rating across all reviews, or empty when there are none.
     */
    java.util.OptionalDouble averageRatingAll();

    List<CommerceDtos.ReviewResponse> list(Long productId);

    /**
     * Highest-rated reviews for storefront social proof, then newest.
     */
    List<CommerceDtos.ReviewResponse> listFeatured(int limit);

    CommerceDtos.ReviewResponse create(String email, CommerceDtos.ReviewRequest request);

    CommerceDtos.ReviewResponse update(String email, Long reviewId, CommerceDtos.ReviewRequest request);

    void delete(String email, Long reviewId);
}
