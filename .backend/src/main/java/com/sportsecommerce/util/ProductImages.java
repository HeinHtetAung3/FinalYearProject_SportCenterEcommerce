package com.sportsecommerce.util;

import java.util.List;
import java.util.Map;

/**
 * Single source of truth for building product image URLs on the backend.
 * Mirrors the frontend resolver in .frontend/src/utils/productImages.js so
 * that switching image backends (Unsplash → local Pexels files → Firebase
 * Storage) is a one-config change rather than touching seed data.
 *
 * Modes (set with PRODUCT_IMAGE_SOURCE env var, e.g. in .env.local):
 *   - "unsplash"  (default) — curated Unsplash photo IDs. Free, no API key.
 *   - "local"            — Vite-served paths under
 *                          /images/products/&lt;slug&gt;/&lt;slug&gt;-N.jpg.
 *                          Browser loads them from the frontend origin.
 *   - "firebase"         — Firebase Storage. Requires
 *                          FIREBASE_STORAGE_BUCKET env var.
 */
public final class ProductImages {

    private static final String MODE = resolveMode();
    private static final String FIREBASE_BUCKET =
            System.getenv().getOrDefault("FIREBASE_STORAGE_BUCKET", "");

    private static final String UNSPLASH_PARAMS = "?auto=format&fit=crop&w=900&q=80";

    private static final Map<String, List<String>> UNSPLASH_POOLS = Map.of(
            "running", List.of(
                    "photo-1542291026-7eec264c27ff",
                    "photo-1595950653106-6c9ebd614d3a",
                    "photo-1517466787929-bc90951d0974",
                    "photo-1571902943202-507ec2618e8f",
                    "photo-1539185441755-769473a23570",
                    "photo-1556906781-9a412961c28c",
                    "photo-1486218119243-13883505764c",
                    "photo-1502904550040-7534597429ae"
            ),
            "football", List.of(
                    "photo-1551958219-acbc608c6377",
                    "photo-1511886929837-354d827aae26",
                    "photo-1574629810360-7efbbe195018",
                    "photo-1517927033932-b3d18e61fb3a",
                    "photo-1543351611-58f69d7c1781",
                    "photo-1518604666860-9ed391f76460",
                    "photo-1577223625816-7546f13df25d"
            ),
            "fitness", List.of(
                    "photo-1581009146145-b5ef050c2e1e",
                    "photo-1534438327276-14e5300c3a48",
                    "photo-1638536532686-d610adfc8e5c",
                    "photo-1591291621164-2c6367723315",
                    "photo-1517836357463-d25dfeac3438",
                    "photo-1571019613454-1cb2f99b2d8b",
                    "photo-1584735935682-2f2b69dff9d2",
                    "photo-1540497077202-7c8a3999166f"
            ),
            "outdoor", List.of(
                    "photo-1551632811-561732d1e306",
                    "photo-1504280390367-361c6d9f38f4",
                    "photo-1496080174650-637e3f22fa03",
                    "photo-1517649763962-0c623066013b",
                    "photo-1493246507139-91e8fad9978e",
                    "photo-1464822759023-fed622ff2c3b",
                    "photo-1455156218388-5e61b526818b"
            ),
            "basketball", List.of(
                    "photo-1546519638-68e109498ffc",
                    "photo-1552346154-21d32810aba3",
                    "photo-1518614368389-89f7b0f6a3f0",
                    "photo-1559692048-79a3f837883d",
                    "photo-1574623452334-1e0ac2b3ccb4",
                    "photo-1608245449230-4ac19066d2d0"
            ),
            "accessories", List.of(
                    "photo-1612872087720-bb876e2e67d1",
                    "photo-1554068865-24cecd4e34b8",
                    "photo-1523275335684-37898b6baf30",
                    "photo-1559056199-641a0ac8b55e",
                    "photo-1542219550-37153d387c27",
                    "photo-1556906781-9a412961c28c"
            )
    );

    private ProductImages() {
    }

    public static String build(String slug, int index) {
        String safeSlug = slug == null ? "" : slug.toLowerCase();
        int safeIndex = index <= 0 ? 1 : index;

        return switch (MODE) {
            case "local" -> buildLocal(safeSlug, safeIndex);
            case "firebase" -> {
                String url = buildFirebase(safeSlug, safeIndex);
                yield url != null ? url : buildUnsplash(safeSlug, safeIndex);
            }
            default -> buildUnsplash(safeSlug, safeIndex);
        };
    }

    public static String mode() {
        return MODE;
    }

    private static String resolveMode() {
        String raw = System.getenv("PRODUCT_IMAGE_SOURCE");
        if (raw == null) {
            return "unsplash";
        }
        String normalized = raw.trim().toLowerCase();
        return switch (normalized) {
            case "local", "firebase", "unsplash" -> normalized;
            default -> "unsplash";
        };
    }

    private static String buildUnsplash(String slug, int index) {
        List<String> pool = UNSPLASH_POOLS.getOrDefault(slug, UNSPLASH_POOLS.get("fitness"));
        int size = pool.size();
        int idx = ((index - 1) % size + size) % size;
        return "https://images.unsplash.com/" + pool.get(idx) + UNSPLASH_PARAMS;
    }

    private static String buildLocal(String slug, int index) {
        return String.format("/images/products/%s/%s-%d.jpg", slug, slug, index);
    }

    private static String buildFirebase(String slug, int index) {
        if (FIREBASE_BUCKET.isEmpty()) {
            return null;
        }
        String objectPath = String.format("products/%s/%s-%d.jpg", slug, slug, index);
        String encoded = java.net.URLEncoder.encode(objectPath, java.nio.charset.StandardCharsets.UTF_8);
        return String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media",
                FIREBASE_BUCKET, encoded);
    }
}
