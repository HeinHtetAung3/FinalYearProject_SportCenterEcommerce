package com.sportsecommerce.dto;

public final class GeoDtos {

    private GeoDtos() {
    }

    public record AddressSuggestion(
            String id,
            String label,
            String addressLine,
            String city,
            String postalCode,
            String country
    ) {
    }
}
