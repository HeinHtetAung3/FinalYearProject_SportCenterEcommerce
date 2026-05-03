package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.exception.ApiException;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.repository.UserJpaRepository;
import com.sportsecommerce.repository.UserSettingsJpaRepository;
import com.sportsecommerce.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ReviewServiceImpl implements ReviewService {

    private static final String VERIFIED_BUYER_LABEL = "Verified buyer";

    private final CatalogRepository catalogRepository;
    private final UserJpaRepository userJpaRepository;
    private final UserSettingsJpaRepository userSettingsJpaRepository;
    private final AtomicLong ids = new AtomicLong(1);
    private final Map<Long, ReviewData> reviews = new ConcurrentHashMap<>();

    public ReviewServiceImpl(
            CatalogRepository catalogRepository,
            UserJpaRepository userJpaRepository,
            UserSettingsJpaRepository userSettingsJpaRepository
    ) {
        this.catalogRepository = catalogRepository;
        this.userJpaRepository = userJpaRepository;
        this.userSettingsJpaRepository = userSettingsJpaRepository;
        seedDemoReviewsIfEmpty();
    }

    @Override
    public long countAll() {
        return reviews.size();
    }

    @Override
    public java.util.OptionalDouble averageRatingAll() {
        int sum = 0;
        int n = 0;
        for (ReviewData r : reviews.values()) {
            if (r.rating != null && r.rating > 0) {
                sum += r.rating;
                n++;
            }
        }
        if (n == 0) {
            return java.util.OptionalDouble.empty();
        }
        return java.util.OptionalDouble.of((double) sum / n);
    }

    private void seedDemoReviewsIfEmpty() {
        if (!reviews.isEmpty()) {
            return;
        }
        var products = catalogRepository.findAllProducts();
        if (products.size() < 3) {
            return;
        }
        String[] comments = {
                "Great quality and fast delivery. Fits true to size.",
                "Solid gear for training — would buy again.",
                "Excellent value. Held up well after months of use.",
                "Love the look and performance on the field.",
                "Comfortable for long runs, breathable material."
        };
        int[] ratings = {5, 5, 4, 5, 4};
        for (int i = 0; i < Math.min(5, products.size()); i++) {
            Product p = products.get(i);
            ReviewData review = new ReviewData(
                    ids.getAndIncrement(),
                    p.id(),
                    p.name(),
                    "demo.reviewer" + i + "@sportshub.local",
                    ratings[i],
                    comments[i],
                    Instant.now().minusSeconds((5 - i) * 86_400L)
            );
            reviews.put(review.id, review);
        }
    }

    @Override
    public java.util.List<CommerceDtos.ReviewResponse> list(Long productId) {
        return reviews.values().stream()
                .filter(review -> productId == null || review.productId.equals(productId))
                .sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
                .map(this::toPublicResponse)
                .toList();
    }

    @Override
    public java.util.List<CommerceDtos.ReviewResponse> listFeatured(int limit) {
        if (limit <= 0) {
            return List.of();
        }
        return reviews.values().stream()
                .sorted(Comparator
                        .comparing(ReviewData::rating, Comparator.nullsFirst(Comparator.naturalOrder())).reversed()
                        .thenComparing(ReviewData::createdAt, Comparator.nullsFirst(Comparator.naturalOrder())).reversed())
                .limit(limit)
                .map(this::toPublicResponse)
                .toList();
    }

    @Override
    public CommerceDtos.ReviewResponse create(String email, CommerceDtos.ReviewRequest request) {
        Product product = findProduct(request.productId());
        boolean duplicate = reviews.values().stream()
                .anyMatch(review -> review.reviewerEmail.equals(email) && review.productId.equals(request.productId()));
        if (duplicate) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already reviewed this product");
        }
        ReviewData review = new ReviewData(
                ids.getAndIncrement(),
                product.id(),
                product.name(),
                email,
                request.rating(),
                request.comment(),
                Instant.now()
        );
        reviews.put(review.id, review);
        return toAuthorResponse(review);
    }

    @Override
    public CommerceDtos.ReviewResponse update(String email, Long reviewId, CommerceDtos.ReviewRequest request) {
        ReviewData current = findOwned(email, reviewId);
        if (!current.productId.equals(request.productId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Product id cannot be changed");
        }
        findProduct(request.productId());
        ReviewData updated = new ReviewData(
                current.id,
                current.productId,
                current.productName,
                current.reviewerEmail,
                request.rating(),
                request.comment(),
                current.createdAt
        );
        reviews.put(reviewId, updated);
        return toAuthorResponse(updated);
    }

    @Override
    public void delete(String email, Long reviewId) {
        findOwned(email, reviewId);
        reviews.remove(reviewId);
    }

    private Product findProduct(Long productId) {
        return catalogRepository.findProductById(productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private ReviewData findOwned(String email, Long reviewId) {
        ReviewData review = reviews.get(reviewId);
        if (review == null || !review.reviewerEmail.equals(email)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Review not found");
        }
        return review;
    }

    /**
     * Public product pages: hide email when the reviewer chose private profile visibility.
     */
    private CommerceDtos.ReviewResponse toPublicResponse(ReviewData r) {
        String label = publicDisplayForReviewer(r.reviewerEmail);
        return new CommerceDtos.ReviewResponse(r.id, r.productId, r.productName, label, r.rating, r.comment, r.createdAt);
    }

    /**
     * Immediately after create/update, show the same label others will see (consistent with list()).
     */
    private CommerceDtos.ReviewResponse toAuthorResponse(ReviewData r) {
        return toPublicResponse(r);
    }

    private String publicDisplayForReviewer(String reviewerEmail) {
        return userJpaRepository.findByEmailIgnoreCase(reviewerEmail)
                .map(user -> userSettingsJpaRepository.findById(user.getId())
                        .map(settings -> {
                            if ("PUBLIC".equalsIgnoreCase(settings.getProfileVisibility())) {
                                return reviewerEmail;
                            }
                            return VERIFIED_BUYER_LABEL;
                        })
                        .orElse(VERIFIED_BUYER_LABEL))
                .orElse(VERIFIED_BUYER_LABEL);
    }

    private record ReviewData(
            Long id,
            Long productId,
            String productName,
            String reviewerEmail,
            Integer rating,
            String comment,
            Instant createdAt
    ) {
    }
}
