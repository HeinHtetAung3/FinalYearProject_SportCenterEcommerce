package com.sportsecommerce.controller;

import com.sportsecommerce.dto.GeoDtos;
import com.sportsecommerce.service.GeoService;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/geo")
public class GeoController {

    private final GeoService geoService;

    public GeoController(GeoService geoService) {
        this.geoService = geoService;
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<GeoDtos.AddressSuggestion>> autocomplete(
            @RequestParam(name = "q") @Size(max = 120) String query
    ) {
        return ResponseEntity.ok(geoService.autocompleteAddress(query));
    }
}
