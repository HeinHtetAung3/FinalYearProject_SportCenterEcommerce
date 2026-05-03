package com.sportsecommerce.service.impl;

import com.sportsecommerce.dto.StorefrontDtos;
import com.sportsecommerce.entity.NewsletterSubscriberEntity;
import com.sportsecommerce.repository.NewsletterSubscriberJpaRepository;
import com.sportsecommerce.service.NewsletterService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NewsletterServiceImpl implements NewsletterService {

    private final NewsletterSubscriberJpaRepository subscriberRepository;

    public NewsletterServiceImpl(NewsletterSubscriberJpaRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    @Override
    @Transactional
    public StorefrontDtos.NewsletterSubscribeResponse subscribe(String email) {
        String normalized = email.trim().toLowerCase();
        if (subscriberRepository.existsByEmailIgnoreCase(normalized)) {
            return new StorefrontDtos.NewsletterSubscribeResponse(true, "You are already subscribed.");
        }
        NewsletterSubscriberEntity row = new NewsletterSubscriberEntity();
        row.setEmail(normalized);
        subscriberRepository.save(row);
        return new StorefrontDtos.NewsletterSubscribeResponse(true, "Thanks for subscribing.");
    }
}
