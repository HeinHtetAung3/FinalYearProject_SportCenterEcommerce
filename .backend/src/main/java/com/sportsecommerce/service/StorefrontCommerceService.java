package com.sportsecommerce.service;

import com.sportsecommerce.dto.StorefrontDtos;

public interface StorefrontCommerceService {

    StorefrontDtos.CommerceCheckoutConfigResponse getCheckoutConfig();
}
