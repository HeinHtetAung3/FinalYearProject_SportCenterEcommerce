package com.sportsecommerce.controller;

import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.service.NewsletterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<StorefrontDtos.NewsletterSubscribeResponse> subscribe(
            @Valid @RequestBody StorefrontDtos.NewsletterSubscribeRequest request
    ) {
        return ResponseEntity.ok(newsletterService.subscribe(request.email()));
    }
}
