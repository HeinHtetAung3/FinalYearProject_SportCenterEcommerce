package com.sportsecommerce.service;

import com.sportsecommerce.dto.StorefrontDtos;

public interface NewsletterService {

    StorefrontDtos.NewsletterSubscribeResponse subscribe(String email);
}
