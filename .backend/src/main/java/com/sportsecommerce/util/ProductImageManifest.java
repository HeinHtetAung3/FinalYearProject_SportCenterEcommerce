package com.sportsecommerce.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads {@code /product-image-manifest.json} from the classpath and exposes
 * gallery paths keyed by API product id (as used by {@code InMemoryCatalogRepository}).
 */
public final class ProductImageManifest {

    private static final Map<Long, List<String>> BY_API_ID = load();

    private ProductImageManifest() {
    }

    public static List<String> imagesForProduct(long apiProductId) {
        return BY_API_ID.getOrDefault(apiProductId, List.of());
    }

    private static Map<Long, List<String>> load() {
        try (InputStream in = ProductImageManifest.class.getResourceAsStream("/product-image-manifest.json")) {
            if (in == null) {
                return Map.of();
            }
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(in);
            JsonNode products = root.path("products");
            if (!products.isArray()) {
                return Map.of();
            }
            Map<Long, List<String>> out = new HashMap<>();
            for (JsonNode n : products) {
                if (!n.hasNonNull("apiId")) {
                    continue;
                }
                long id = n.get("apiId").asLong();
                List<String> imgs = new ArrayList<>();
                for (JsonNode img : n.path("images")) {
                    if (img.isTextual()) {
                        imgs.add(img.asText());
                    }
                }
                if (!imgs.isEmpty()) {
                    out.put(id, Collections.unmodifiableList(imgs));
                }
            }
            return Collections.unmodifiableMap(out);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load product-image-manifest.json", e);
        }
    }
}
