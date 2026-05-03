package com.sportsecommerce.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.sportsecommerce.dto.GeoDtos;
import com.sportsecommerce.service.GeoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class GeoServiceImpl implements GeoService {

    private static final int MAX_RESULTS = 6;
    private static final String PHOTON_BASE_URL = "https://photon.komoot.io/api/";

    private static final Logger log = LoggerFactory.getLogger(GeoServiceImpl.class);
    private final ObjectMapper objectMapper;

    public GeoServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public List<GeoDtos.AddressSuggestion> autocompleteAddress(String query) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 3) {
            return List.of();
        }

        String url = UriComponentsBuilder.fromHttpUrl(PHOTON_BASE_URL)
                .queryParam("q", q)
                .queryParam("limit", MAX_RESULTS)
                .queryParam("lang", "en")
                .toUriString();

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                    .header("User-Agent", "sports-ecommerce/1.0 (checkout address autocomplete)")
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String json = response.body();
            JsonNode root = json == null ? null : objectMapper.readTree(json);
            JsonNode features = root == null ? null : root.get("features");
            if (features == null || !features.isArray()) {
                String rootType = root == null ? null : root.path("type").asText("");
                String preview = json == null ? null : json.substring(0, Math.min(220, json.length())).replaceAll("\\s+", " ");
                log.warn("Photon autocomplete: missing/invalid features. query='{}' url='{}' rootType='{}' jsonPreview='{}'",
                        q, url, rootType, preview);
                return List.of();
            }

            List<GeoDtos.AddressSuggestion> results = new ArrayList<>();
            int index = 0;
            for (JsonNode feature : features) {
                JsonNode props = feature.path("properties");
                String street = text(props, "street");
                String houseNumber = text(props, "housenumber");
                String name = text(props, "name");
                String city = firstNonBlank(
                        text(props, "city"),
                        text(props, "town"),
                        text(props, "village"),
                        text(props, "county")
                );
                String postalCode = text(props, "postcode");
                String country = text(props, "country");
                String state = text(props, "state");
                String addressLine = firstNonBlank(joinNonBlank(" ", houseNumber, street), name);
                if (isBlank(addressLine) && isBlank(city) && isBlank(country)) {
                    continue;
                }

                String label = joinNonBlank(", ", addressLine, city, state, postalCode, country);
                String osmId = text(props, "osm_id");
                if (isBlank(osmId)) {
                    osmId = "addr";
                }

                results.add(new GeoDtos.AddressSuggestion(
                        osmId + "-" + index++,
                        label,
                        addressLine,
                        city,
                        postalCode,
                        country
                ));
            }
            if (results.isEmpty()) {
                int featureCount = features == null ? -1 : features.size();
                log.warn("Photon autocomplete: parsed 0 suggestions. query='{}' url='{}' featureCount='{}'", q, url, featureCount);
            }
            return results;
        } catch (IOException | InterruptedException ex) {
            log.warn("Photon autocomplete failed. query='{}' url='{}' error='{}'", q, url, ex.toString());
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            return List.of();
        }
    }

    private static String text(JsonNode node, String key) {
        JsonNode child = node.path(key);
        return child.isMissingNode() || child.isNull() ? "" : child.asText("").trim();
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private static String joinNonBlank(String separator, String... values) {
        List<String> parts = new ArrayList<>();
        for (String value : values) {
            if (!isBlank(value)) {
                parts.add(value.trim());
            }
        }
        return String.join(separator, parts);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
