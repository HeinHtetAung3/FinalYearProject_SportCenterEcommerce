package com.sportsecommerce.service;

import com.sportsecommerce.dto.GeoDtos;

import java.util.List;

public interface GeoService {
    List<GeoDtos.AddressSuggestion> autocompleteAddress(String query);
}
