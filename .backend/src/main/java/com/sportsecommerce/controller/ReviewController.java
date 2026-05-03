package com.sportsecommerce.controller;

import com.sportsecommerce.dto.CommerceDtos;
import com.sportsecommerce.service.ReviewService;
import com.sportsecommerce.service.UserContextResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserContextResolver userContextResolver;

    public ReviewController(ReviewService reviewService, UserContextResolver userContextResolver) {
        this.reviewService = reviewService;
        this.userContextResolver = userContextResolver;
    }

    @GetMapping
    public ResponseEntity<List<CommerceDtos.ReviewResponse>> list(@RequestParam(required = false) Long productId) {
        return ResponseEntity.ok(reviewService.list(productId));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<CommerceDtos.ReviewResponse>> featured(
            @RequestParam(defaultValue = "6") int limit
    ) {
        return ResponseEntity.ok(reviewService.listFeatured(limit));
    }

    @PostMapping
    public ResponseEntity<CommerceDtos.ReviewResponse> create(@Valid @RequestBody CommerceDtos.ReviewRequest request) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        return ResponseEntity.ok(reviewService.create(email, request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<CommerceDtos.ReviewResponse> update(
            @PathVariable Long reviewId,
            @Valid @RequestBody CommerceDtos.ReviewRequest request
    ) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        return ResponseEntity.ok(reviewService.update(email, reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId) {
        String email = userContextResolver.resolveAuthenticatedEmail();
        reviewService.delete(email, reviewId);
        return ResponseEntity.noContent().build();
    }
}
