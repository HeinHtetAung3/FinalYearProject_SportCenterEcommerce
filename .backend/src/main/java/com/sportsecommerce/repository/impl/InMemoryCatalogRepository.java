package com.sportsecommerce.repository.impl;

import com.sportsecommerce.model.Category;
import com.sportsecommerce.model.Product;
import com.sportsecommerce.repository.CatalogProductQuery;
import com.sportsecommerce.repository.CatalogRepository;
import com.sportsecommerce.util.ProductImageManifest;
import com.sportsecommerce.util.ProductImages;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * In-memory implementation of the catalog. Mirrors the demo dataset in
 * {@code .frontend/src/data/mockCatalog.js} / {@code products.js} so the
 * live API and the frontend demo-mode fallback stay aligned where it matters
 * for facets and related-product rails.
 */
@Repository
public class InMemoryCatalogRepository implements CatalogRepository {

    private final List<Category> categories = List.of(
            new Category(1L, "Running", "running"),
            new Category(2L, "Football", "football"),
            new Category(3L, "Fitness", "fitness"),
            new Category(4L, "Outdoor", "outdoor"),
            new Category(5L, "Basketball", "basketball"),
            new Category(6L, "Training", "training"),
            new Category(7L, "Accessories", "accessories"),
            new Category(8L, "Lifestyle", "lifestyle")
    );

    private final Map<Long, Product> products = new ConcurrentHashMap<>();
    private final AtomicLong productIds = new AtomicLong(1);

    public InMemoryCatalogRepository() {
        seedCategory(1L, "running", 1, mapSpecs(RUNNING_SPECS));
        seedCategory(2L, "football", 1, FOOTBALL_RICH);
        seedCategory(3L, "fitness", 1, mapSpecs(FITNESS_SPECS));
        seedCategory(4L, "outdoor", 1, mapSpecs(OUTDOOR_SPECS));
        seedCategory(5L, "basketball", 1, mapSpecs(BASKETBALL_SPECS));
        seedCategory(6L, "fitness", 21, mapSpecs(TRAINING_SPECS));
        seedCategory(7L, "accessories", 1, mapSpecs(ACCESSORIES_SPECS));
        seedLifestyle();
        productIds.set(10_000L);
    }

    @Override
    public List<Product> findProducts(CatalogProductQuery q) {
        return products.values().stream()
                .filter(Product::storefrontVisible)
                .filter(p -> matchesTextSearch(p, q))
                .filter(p -> q.categoryId() == null || q.categoryId().equals(p.categoryId()))
                .filter(p -> q.minPrice() == null || p.price().compareTo(q.minPrice()) >= 0)
                .filter(p -> q.maxPrice() == null || p.price().compareTo(q.maxPrice()) <= 0)
                .filter(p -> q.minRating() == null || (p.rating() != null && p.rating() >= q.minRating()))
                .filter(p -> matchesBrandFacet(p, q.brandCsv()))
                .filter(p -> matchesEuFacet(p, q.euCsv()))
                .filter(p -> matchesColorFacet(p, q.colorCsv()))
                .filter(p -> matchesGenderFacet(p, q.genderCsv()))
                .filter(p -> matchesInStockFacet(p, q.inStock()))
                .filter(p -> matchesSubcategoryFacet(p, q.subcategory()))
                .filter(p -> matchesNewArrivalFacet(p, q.isNewArrival()))
                .filter(p -> matchesBestSellerFacet(p, q.isBestSeller()))
                .filter(p -> matchesOnSaleFacet(p, q.onSale()))
                .sorted(Comparator.comparing(Product::id))
                .toList();
    }

    @Override
    public List<Category> findAllCategories() {
        return categories;
    }

    @Override
    public List<Product> findAllProducts() {
        return products.values().stream().sorted(Comparator.comparing(Product::id)).toList();
    }

    @Override
    public List<String> findDistinctBrandNames() {
        return products.values().stream()
                .map(Product::brand)
                .filter(b -> b != null && !b.isBlank())
                .map(b -> b.trim())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    @Override
    public long countProducts() {
        return products.size();
    }

    @Override
    public long countStorefrontProducts() {
        return products.values().stream().filter(Product::storefrontVisible).count();
    }

    @Override
    public Optional<Product> findProductById(Long productId) {
        return Optional.ofNullable(products.get(productId));
    }

    @Override
    public Optional<Category> findCategoryById(Long categoryId) {
        return categories.stream().filter(category -> category.id().equals(categoryId)).findFirst();
    }

    @Override
    public Product saveProduct(Product product) {
        products.put(product.id(), product);
        return product;
    }

    @Override
    public boolean deleteProduct(Long productId) {
        return products.remove(productId) != null;
    }

    @Override
    public Long nextProductId() {
        return productIds.getAndIncrement();
    }

    @Override
    public List<Product> findRelatedProducts(Long productId, int limit) {
        if (limit <= 0) {
            return List.of();
        }
        Product source = products.get(productId);
        if (source == null || !source.storefrontVisible()) {
            return List.of();
        }

        List<Product> sameCategory = products.values().stream()
                .filter(Product::storefrontVisible)
                .filter(p -> !p.id().equals(productId) && p.categoryId().equals(source.categoryId()))
                .sorted(Comparator.comparing(Product::rating, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(limit)
                .collect(Collectors.toCollection(ArrayList::new));

        if (sameCategory.size() >= limit) {
            return sameCategory;
        }

        Set<Long> seen = new HashSet<>();
        seen.add(productId);
        sameCategory.forEach(p -> seen.add(p.id()));

        int need = limit - sameCategory.size();
        List<Product> fillers = products.values().stream()
                .filter(Product::storefrontVisible)
                .filter(p -> !seen.contains(p.id()) && !p.categoryId().equals(source.categoryId()))
                .sorted(Comparator.comparing(Product::rating, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(need)
                .toList();

        List<Product> out = new ArrayList<>(sameCategory);
        out.addAll(fillers);
        return out;
    }

    private void seedCategory(long categoryId, String imageSlug, int imageStart, RichSpec[] specs) {
        for (int i = 0; i < specs.length; i++) {
            RichSpec s = specs[i];
            long id = categoryId * 100 + (i + 1);
            int imageIndex = imageStart + i;
            saveProduct(buildProduct(id, categoryId, imageSlug, imageIndex, s));
        }
    }

    private void seedLifestyle() {
        String[] subs = {"Sneakers", "Hoodies", "T-Shirts", "Joggers", "Caps", "Bags"};
        String[] genders = {"Men", "Women", "Kids", "Unisex"};
        String[] brands = {"Adidas", "Nike", "Puma"};
        List<Integer> sneakerSizes = List.of(40, 41, 42, 43, 44);
        List<String> paletteA = List.of("Core Black", "Cloud White");
        List<String> paletteB = List.of("Solar Red", "Core Black", "Cloud White");

        for (int i = 0; i < 50; i++) {
            long id = 801L + i;
            String sub = subs[i % subs.length];
            String gender = genders[i % genders.length];
            String brand = brands[i % brands.length];
            BigDecimal price = new BigDecimal(String.format(Locale.ROOT, "%.2f", 39.99 + (i % 12) * 7.5));
            double rating = 4.2 + (i % 9) * 0.1;
            int stock = 12 + (i * 5) % 55;
            boolean sneakers = "Sneakers".equals(sub);
            List<Integer> sizes = sneakers ? sneakerSizes : List.of();
            List<String> colors = (i % 2 == 0) ? paletteA : paletteB;

            String name = sub + " " + brand + " " + (i + 1);
            String description = "Street-ready " + sub.toLowerCase(Locale.ROOT) + " piece from the lifestyle line — comfort-focused fabrics and "
                    + "clean branding for everyday wear.";
            int imgIdx = (i % 20) + 1;
            RichSpec spec = new RichSpec(
                    name, description, price.toPlainString(), rating, stock,
                    brand, sizes, colors, null, gender, sub
            );
            saveProduct(buildProduct(id, 8L, "running", imgIdx, spec));
        }
    }

    private Product buildProduct(long id, long categoryId, String imageSlug, int imageIndex, RichSpec s) {
        List<String> manifestImgs = ProductImageManifest.imagesForProduct(id);
        List<String> imgs;
        if (manifestImgs != null && !manifestImgs.isEmpty()) {
            imgs = manifestImgs;
        } else {
            imgs = s.imageOverride();
            if (imgs == null || imgs.isEmpty()) {
                imgs = List.of(ProductImages.build(imageSlug, imageIndex));
            }
        }
        String hero = imgs.get(0);
        List<Integer> sizes = s.sizes() == null ? List.of() : s.sizes();
        List<String> colors = s.colors() == null ? List.of() : s.colors();
        BigDecimal price = new BigDecimal(s.price());
        boolean newArrival = (id % 4 == 1L);
        boolean bestSeller = (id % 5 == 2L);
        BigDecimal compareAt = (id % 6 == 0L)
                ? price.multiply(new BigDecimal("1.12")).setScale(2, RoundingMode.HALF_UP)
                : null;
        return new Product(
                id,
                s.name(),
                s.description(),
                price,
                s.rating(),
                s.stock(),
                categoryId,
                hero,
                s.brand(),
                sizes,
                colors,
                imgs,
                s.gender(),
                s.subcategory(),
                newArrival,
                bestSeller,
                compareAt,
                true
        );
    }

    private static RichSpec[] mapSpecs(Spec[] specs) {
        return Arrays.stream(specs).map(RichSpec::fromSpec).toArray(RichSpec[]::new);
    }

    private String categoryName(Long categoryId) {
        return categories.stream()
                .filter(c -> c.id().equals(categoryId))
                .map(Category::name)
                .findFirst()
                .orElse("");
    }

    private boolean matchesTextSearch(Product p, CatalogProductQuery q) {
        String search = q.search();
        if (search == null || search.isBlank()) {
            return true;
        }
        String n = search.toLowerCase(Locale.ROOT);
        if (p.name().toLowerCase(Locale.ROOT).contains(n)
                || p.description().toLowerCase(Locale.ROOT).contains(n)) {
            return true;
        }
        if (p.brand() != null && p.brand().toLowerCase(Locale.ROOT).contains(n)) {
            return true;
        }
        return categoryName(p.categoryId()).toLowerCase(Locale.ROOT).contains(n);
    }

    private static boolean matchesBrandFacet(Product p, String brandCsv) {
        Set<String> wanted = parseCsvLower(brandCsv);
        if (wanted.isEmpty()) {
            return true;
        }
        if (p.brand() == null || p.brand().isBlank()) {
            return false;
        }
        return wanted.contains(p.brand().toLowerCase(Locale.ROOT));
    }

    private static boolean matchesEuFacet(Product p, String euCsv) {
        Set<Integer> wanted = parseEuSizes(euCsv);
        if (wanted.isEmpty()) {
            return true;
        }
        List<Integer> sizes = p.sizes();
        if (sizes == null || sizes.isEmpty()) {
            return false;
        }
        return sizes.stream().anyMatch(wanted::contains);
    }

    private static boolean matchesColorFacet(Product p, String colorCsv) {
        Set<String> wantedSlugs = parseCsvLower(colorCsv);
        if (wantedSlugs.isEmpty()) {
            return true;
        }
        List<String> colors = p.colors();
        if (colors == null || colors.isEmpty()) {
            return false;
        }
        return colors.stream().map(InMemoryCatalogRepository::slugifyColorLabel).anyMatch(wantedSlugs::contains);
    }

    private static boolean matchesGenderFacet(Product p, String genderCsv) {
        Set<String> wanted = parseCsvLower(genderCsv);
        if (wanted.isEmpty()) {
            return true;
        }
        String g = p.gender();
        if (g == null || g.isBlank()) {
            return true;
        }
        String gl = g.toLowerCase(Locale.ROOT);
        if ("unisex".equals(gl)) {
            return true;
        }
        return wanted.contains(gl);
    }

    private static boolean matchesInStockFacet(Product p, Boolean inStock) {
        if (inStock == null || !inStock) {
            return true;
        }
        return p.stock() != null && p.stock() > 0;
    }

    private static boolean matchesSubcategoryFacet(Product p, String subcategory) {
        if (subcategory == null || subcategory.isBlank()) {
            return true;
        }
        String s = p.subcategory();
        if (s == null || s.isBlank()) {
            return false;
        }
        return s.equalsIgnoreCase(subcategory.trim());
    }

    private static boolean matchesNewArrivalFacet(Product p, Boolean flag) {
        if (flag == null || !flag) {
            return true;
        }
        return p.newArrival();
    }

    private static boolean matchesBestSellerFacet(Product p, Boolean flag) {
        if (flag == null || !flag) {
            return true;
        }
        return p.bestSeller();
    }

    private static boolean matchesOnSaleFacet(Product p, Boolean flag) {
        if (flag == null || !flag) {
            return true;
        }
        return p.compareAtPrice() != null && p.compareAtPrice().compareTo(p.price()) > 0;
    }

    private static Set<String> parseCsvLower(String raw) {
        if (raw == null || raw.isBlank()) {
            return Set.of();
        }
        Set<String> out = new HashSet<>();
        for (String part : raw.split(",")) {
            String t = part.trim().toLowerCase(Locale.ROOT);
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    private static Set<Integer> parseEuSizes(String raw) {
        if (raw == null || raw.isBlank()) {
            return Set.of();
        }
        Set<Integer> out = new HashSet<>();
        for (String part : raw.split(",")) {
            String t = part.trim();
            if (!t.isEmpty()) {
                try {
                    out.add(Integer.parseInt(t));
                } catch (NumberFormatException ignored) {
                    // ignore invalid facet token
                }
            }
        }
        return out;
    }

    /**
     * Normalises a colour label to the slug shape used in URL params,
     * matching {@code slugifyColorLabel} in the frontend mock catalog.
     */
    private static String slugifyColorLabel(String value) {
        if (value == null) {
            return "";
        }
        String s = value.toLowerCase(Locale.ROOT).replace('/', ' ');
        s = s.replaceAll("[^a-z0-9\\s-]", "");
        s = s.trim().replaceAll("\\s+", "-");
        return s;
    }

    private static List<String> footballGallery(int photoStart) {
        List<String> urls = new ArrayList<>(4);
        for (int k = 0; k < 4; k++) {
            urls.add(ProductImages.build("football", photoStart + k + 1));
        }
        return List.copyOf(urls);
    }

    private static RichSpec[] buildFootballRichSpecs() {
        List<Integer> eu = List.of(40, 41, 42, 43, 44);
        int[] bootRowIndices = {0, 4, 11};
        RichSpec[] out = new RichSpec[FOOTBALL_SPECS.length];
        for (int i = 0; i < FOOTBALL_SPECS.length; i++) {
            Spec s = FOOTBALL_SPECS[i];
            int bootSlot = -1;
            for (int b = 0; b < bootRowIndices.length; b++) {
                if (bootRowIndices[b] == i) {
                    bootSlot = b;
                    break;
                }
            }
            if (bootSlot >= 0) {
                BootFacet b = FOOTBALL_BOOT_FACETS[bootSlot];
                out[i] = new RichSpec(
                        s.name(), s.description(), s.price(), s.rating(), s.stock(),
                        b.brand(), eu, b.colors(), footballGallery(b.photoStart), null, null
                );
            } else {
                out[i] = RichSpec.fromSpec(s);
            }
        }
        return out;
    }

    private record BootFacet(String brand, int photoStart, List<String> colors) {
    }

    /** Brand / colours / gallery offsets for football boot rows (see {@code footballProducts} in {@code products.js}). */
    private static final BootFacet[] FOOTBALL_BOOT_FACETS = {
            new BootFacet("Adidas", 0, List.of("Solar Red", "Core Black", "Cloud White")),
            new BootFacet("Adidas", 3, List.of("Lucid Lemon", "Solar Red", "Core Black")),
            new BootFacet("Nike", 2, List.of("Bright Crimson", "Mint Foam", "Black / Anthracite"))
    };

    private record Spec(String name, String description, String price, double rating, int stock) {
    }

    private record RichSpec(
            String name,
            String description,
            String price,
            double rating,
            int stock,
            String brand,
            List<Integer> sizes,
            List<String> colors,
            List<String> imageOverride,
            String gender,
            String subcategory
    ) {
        static RichSpec fromSpec(Spec s) {
            return new RichSpec(s.name(), s.description(), s.price(), s.rating(), s.stock(),
                    null, List.of(), List.of(), null, null, null);
        }
    }

    private static final Spec[] RUNNING_SPECS = {
            new Spec("Sprint Pro Running Shoes", "Lightweight, breathable shoes engineered for race-day pace with carbon-plate propulsion.", "129.99", 4.8, 24),
            new Spec("TrailBlaze All-Terrain Trainers", "Aggressive lugs and waterproof upper for unpredictable trails.", "159.00", 4.6, 18),
            new Spec("Cloud Glide Marathon Shoes", "Plush long-distance cushioning with rocker geometry.", "179.50", 4.7, 14),
            new Spec("Velocity Race Singlet", "Featherweight, sweat-wicking race singlet with seamless construction.", "39.99", 4.4, 60),
            new Spec("Pacemaker Lightweight Trainers", "Daily trainer with springy foam midsole and breathable mesh upper.", "119.00", 4.5, 30),
            new Spec("Ridgeline Trail Runners", "Vibram outsole and rock-plate protection for technical trails.", "169.00", 4.6, 12),
            new Spec("AirStream Daily Trainer", "Soft heel cradle and forefoot rebound for everyday miles.", "109.99", 4.3, 40),
            new Spec("Carbon Plate Race Shoes", "Full-length carbon plate for a measurable race-day boost.", "219.00", 4.9, 9),
            new Spec("Featherweight Running Shorts", "4-inch quick-dry shorts with built-in liner and back zip pocket.", "34.99", 4.4, 95),
            new Spec("Reflective Run Vest", "360-degree reflectivity and adjustable fit for low-light runs.", "49.99", 4.5, 55),
            new Spec("Compression Calf Sleeves", "Graduated compression to support stride and recovery.", "22.99", 4.3, 130),
            new Spec("Hi-Vis Running Cap", "Featherweight cap with sweatband and reflective trim.", "19.99", 4.2, 200),
            new Spec("Quick-Dry Running Tee", "Anti-odor mesh tee with flatlock seams and laser-cut vents.", "29.99", 4.4, 150),
            new Spec("Long-Distance Running Tights", "Compression tights with reflective taping and side pockets.", "79.00", 4.5, 40),
            new Spec("Pro-Cushion Running Socks (3-Pack)", "Targeted cushioning, arch support and seamless toes.", "24.99", 4.6, 220),
            new Spec("Thermal Running Jacket", "Brushed inner face traps heat without bulk; water-resistant shell.", "119.00", 4.5, 28),
            new Spec("Ergonomic Running Belt", "Bounce-free running belt with phone pocket and gel loops.", "27.99", 4.4, 110),
            new Spec("Hydration Running Vest 5L", "Soft flask-friendly running vest for half-marathon and beyond.", "89.99", 4.6, 22),
            new Spec("Anti-Blister Run Insoles", "Heat-moldable insoles with metatarsal pad and arch support.", "39.99", 4.4, 80),
            new Spec("Night Run LED Armband", "USB-rechargeable LED armband with 3 modes for visibility.", "17.99", 4.3, 180)
    };

    private static final Spec[] FOOTBALL_SPECS = {
            new Spec("Velocity X Studded Football Boots", "Soft synthetic upper with precision-stud configuration.", "189.50", 4.7, 12),
            new Spec("Match Day Pro Football", "FIFA-approved match ball with thermo-bonded panels.", "39.99", 4.4, 60),
            new Spec("Goalkeeper Elite Gloves", "Latex palm with finger-spine protection.", "64.00", 4.5, 28),
            new Spec("Pitch Shin Guards", "Lightweight carbon shin guards with breathable padded sleeves.", "29.99", 4.3, 75),
            new Spec("Tactic Astro-Turf Boots", "Multi-stud rubber outsole for grip on artificial grass.", "119.00", 4.4, 35),
            new Spec("Pro Training Football", "Hand-stitched training ball built for daily repetition.", "24.99", 4.3, 120),
            new Spec("Stadium Replica Jersey", "Breathable replica jersey with team-color crest detailing.", "79.00", 4.5, 50),
            new Spec("Captain Armband Set", "Soft-touch captain armband with hook-and-loop closure (3 sizes).", "12.99", 4.2, 200),
            new Spec("Match-Grade Goalkeeper Jersey", "Padded elbows and breathable mesh panels for keepers.", "89.00", 4.5, 22),
            new Spec("Pro Football Socks", "Compression cushioning with anti-slip pads and arch support.", "19.99", 4.4, 180),
            new Spec("Goalkeeper Padded Pants", "Hip and thigh padding with reinforced knees for diving training.", "54.99", 4.3, 30),
            new Spec("Carbon Stud Boots Pro", "Precision-engineered carbon plate for explosive turns.", "229.00", 4.8, 8),
            new Spec("Coach's Whistle & Lanyard Pack", "Pea-less coach whistle with lanyard and finger grip.", "9.99", 4.4, 240),
            new Spec("Tactical Coach Board", "Magnetic coach board with dry-erase pitch and player magnets.", "39.99", 4.5, 45),
            new Spec("Speed Ladder for Football Drills", "4m flat-rung ladder for sprint and footwork training.", "24.99", 4.4, 90),
            new Spec("Football Pump & Needle Kit", "Dual-action pump with pressure gauge and 4 needles.", "14.99", 4.3, 160),
            new Spec("Mini Pop-Up Goal Set", "Pair of pop-up training goals (1.5m) with carry bag.", "49.99", 4.4, 60),
            new Spec("Striker Training Vest", "Reversible mesh vest set (10 pcs) in two colors.", "34.99", 4.3, 75),
            new Spec("Pro Match Corner Flags (Set of 4)", "Spring-loaded corner flags with weighted base.", "24.99", 4.2, 100),
            new Spec("Match Ball Carry Net", "Heavy-duty net carries up to 12 size-5 footballs.", "17.99", 4.4, 110)
    };

    private static final RichSpec[] FOOTBALL_RICH = buildFootballRichSpecs();

    private static final Spec[] FITNESS_SPECS = {
            new Spec("Core Strength Kettlebell 16kg", "Cast-iron kettlebell ideal for swings, presses and conditioning.", "64.99", 4.7, 40),
            new Spec("PowerForge Adjustable Dumbbells", "Quick-select dumbbells from 5 to 50 lbs. Replaces 15 pairs.", "349.00", 4.8, 14),
            new Spec("IronCore Olympic Barbell 20kg", "Knurled, dual-marked Olympic barbell rated for 1500 lb.", "279.00", 4.9, 6),
            new Spec("FlexGrip Premium Yoga Mat", "Non-slip 6mm yoga mat with closed-cell sweat-resistant surface.", "49.50", 4.5, 80),
            new Spec("Hex Rubber Dumbbell Pair 10kg", "Rubber-coated hex dumbbells with chrome-plated handles.", "89.99", 4.6, 38),
            new Spec("Olympic Bumper Plate Set", "Color-coded bumper plates designed for explosive lifts.", "449.00", 4.8, 9),
            new Spec("EZ-Curl Bar 1.2m", "Steel curl bar with diamond knurling and rotating sleeves.", "79.00", 4.5, 25),
            new Spec("Adjustable Weight Bench", "Seven-position bench rated to 300 kg.", "219.00", 4.6, 17),
            new Spec("Compact Power Rack", "Half-rack with safety arms, J-cups and pull-up bar.", "599.00", 4.7, 4),
            new Spec("Wall Ball 9kg", "Soft-shell wall ball with 14-inch diameter and double-stitched seams.", "49.99", 4.5, 40),
            new Spec("Slam Ball 12kg", "Sand-filled slam ball with no-bounce, grippy textured shell.", "59.99", 4.6, 32),
            new Spec("Foam Roller 90cm", "High-density EVA foam roller for myofascial release.", "34.99", 4.5, 110),
            new Spec("Massage Gun Pro", "Percussive therapy massager with 6 heads and quiet brushless motor.", "149.00", 4.7, 28),
            new Spec("Cushioned Yoga Block (Pair)", "Anti-slip EVA blocks for support in deeper poses.", "19.99", 4.4, 200),
            new Spec("Weighted Vest 10kg", "Adjustable weighted vest with reflective trim for conditioning.", "89.00", 4.5, 25),
            new Spec("Lifting Belt with Lever", "10mm leather lifting belt with quick-release lever buckle.", "79.00", 4.7, 30),
            new Spec("Wrist Wraps Pro", "Heavy-duty wrist wraps with thumb loop and IPF approval.", "24.99", 4.5, 130),
            new Spec("Pull-Up Doorway Bar", "No-screw doorway pull-up bar with foam grips, holds 130 kg.", "39.99", 4.4, 70),
            new Spec("Boxing Heavy Bag 35kg", "Pre-filled synthetic-leather heavy bag with chain anchors.", "169.00", 4.6, 15),
            new Spec("Cable Tricep Rope Attachment", "Heavy-duty rope attachment with non-slip rubber ends.", "19.99", 4.5, 90)
    };

    private static final Spec[] OUTDOOR_SPECS = {
            new Spec("Summit 40L Hiking Pack", "Ergonomic 40L pack with adjustable torso and rain cover.", "129.00", 4.6, 22),
            new Spec("TrailLite 2-Person Tent", "Freestanding 3-season tent under 2.4 kg with full-coverage rainfly.", "219.00", 4.7, 11),
            new Spec("AlpineDown Sleeping Bag", "650-fill down bag rated to -7C, packs small without losing loft.", "189.99", 4.5, 17),
            new Spec("Carbon Trekking Poles", "Featherweight foldable carbon poles with cork grips.", "89.00", 4.4, 35),
            new Spec("WaterShed Hiking Boots", "Waterproof leather hiking boots with Vibram outsole.", "159.00", 4.6, 20),
            new Spec("Compact Camp Stove", "Single-burner backpacking stove with auto-ignition.", "49.99", 4.5, 60),
            new Spec("800ml Insulated Trail Mug", "Vacuum-insulated stainless mug keeps coffee hot for 6 hours.", "24.99", 4.4, 140),
            new Spec("Lightweight Camp Chair", "Foldable aluminum camp chair, 1.1 kg, holds 130 kg.", "79.00", 4.5, 35),
            new Spec("Headlamp 600 Lumen", "USB-rechargeable headlamp with red night mode and 30h runtime.", "39.99", 4.5, 95),
            new Spec("Hardshell Mountain Jacket", "Waterproof, breathable hardshell with helmet-compatible hood.", "229.00", 4.7, 14),
            new Spec("Compass Pro", "Sighting compass with adjustable declination and clinometer.", "29.99", 4.4, 120),
            new Spec("Multi-Tool Hiking Knife", "14-in-1 multi-tool with locking blade and rescue hook.", "59.99", 4.6, 80),
            new Spec("Inflatable Sleeping Pad", "4-season insulated pad with R-value 4.2, packs to 18cm.", "99.00", 4.5, 28),
            new Spec("Quick-Set Bivy Shelter", "Single-pole bivy shelter for fast-and-light overnighters.", "149.00", 4.4, 12),
            new Spec("Trekking Daypack 25L", "Lightweight daypack with hipbelt and hydration sleeve.", "79.00", 4.5, 50),
            new Spec("Solar Camp Lantern", "Collapsible solar/USB lantern with 200 lumens and 50h runtime.", "34.99", 4.4, 90),
            new Spec("Weatherproof Map Case", "Roll-top dry case fits topographic maps; lanyard included.", "19.99", 4.3, 140),
            new Spec("UltraLite Backpacking Cookset", "4-piece anodized cookset packs into a 1L pot.", "49.99", 4.5, 40),
            new Spec("Thermal Hiking Socks (Pair)", "Merino wool blend socks with reinforced heel and toe.", "22.99", 4.6, 180),
            new Spec("Bear-Resistant Food Container", "IGBC-approved 5L bear canister for backcountry trips.", "89.99", 4.5, 22)
    };

    private static final Spec[] BASKETBALL_SPECS = {
            new Spec("Court King Basketball Shoes", "High-cut ankle support, herringbone traction and full-length cushioning.", "145.00", 4.5, 9),
            new Spec("Slam Dunk Indoor Basketball", "Composite leather basketball with deep channels for grip and control.", "49.99", 4.6, 45),
            new Spec("Pro Hoop Compression Sleeve", "Targeted compression and padded forearm panel.", "24.00", 4.2, 90),
            new Spec("Driveway Hoop System", "Adjustable 7-10 ft pole-mounted hoop with shatter-resistant backboard.", "399.00", 4.6, 5),
            new Spec("Outdoor Street Basketball", "Rubber-cover outdoor ball built for asphalt and concrete.", "29.99", 4.4, 110),
            new Spec("Hi-Top Court Shoes", "Hi-top court shoes with full-length air cushioning.", "159.00", 4.7, 18),
            new Spec("Premium Leather Game Ball", "Full-grain leather game ball, indoor use only.", "79.99", 4.7, 25),
            new Spec("Mini Indoor Hoop Set", "Over-the-door mini hoop with breakaway rim and foam ball.", "34.99", 4.4, 80),
            new Spec("Basketball Training Headband", "Sweat-wicking headband with reflective trim.", "12.99", 4.3, 200),
            new Spec("Knee Pads Pro", "Anti-slip silicone grip and EVA cushioning protect during dives.", "29.99", 4.5, 75),
            new Spec("Ball Pump with Gauge", "Dual-action pump with pressure gauge and 3 needles.", "14.99", 4.4, 150),
            new Spec("Court Cleaning Mop", "Microfiber court mop with extendable handle for hardwood floors.", "49.99", 4.4, 30),
            new Spec("Heavy-Duty Net Replacement", "All-weather nylon net resists fraying in rain and sun.", "14.99", 4.3, 220),
            new Spec("Adjustable Backboard Pad", "Reduces shock and protects players around the rim.", "89.00", 4.5, 18),
            new Spec("Resistance Dribble Goggles", "Restrict downward vision to develop dribble feel.", "24.99", 4.3, 95),
            new Spec("Pro Shooting Sleeve", "Compression shooting sleeve with elbow padding.", "22.99", 4.4, 130),
            new Spec("Basketball Carry Bag (Holds 6)", "Heavy-duty mesh carry bag with reinforced straps.", "34.99", 4.4, 65),
            new Spec("Anti-Slip Grip Spray", "Tacky shoe-grip spray restores court traction in seconds.", "17.99", 4.2, 140),
            new Spec("Wall-Mounted Hoop Bracket", "Steel mounting bracket fits standard backboards.", "119.00", 4.5, 14),
            new Spec("Tournament Scoreboard", "Portable LED scoreboard with shot clock and remote.", "299.00", 4.6, 6)
    };

    private static final Spec[] TRAINING_SPECS = {
            new Spec("Agility Speed Ladder", "4m flat-rung speed ladder with carry bag for footwork drills.", "24.99", 4.5, 110),
            new Spec("Plyo Box Set 20/24/30", "3-in-1 wooden plyometric box for box jumps and step-ups.", "169.00", 4.7, 19),
            new Spec("Resistance Band Bundle", "Five graduated loop bands plus door anchor for mobility and travel.", "29.00", 4.4, 140),
            new Spec("Battle Rope 15m", "38mm poly-dac battle rope with heat-shrink end caps.", "79.00", 4.6, 24),
            new Spec("12-Pack Agility Cones", "Stackable 23cm agility cones with mesh carry bag.", "14.99", 4.4, 220),
            new Spec("Hurdle Set 15cm/22cm", "Pair of adjustable plastic hurdles for plyometric drills.", "39.99", 4.5, 80),
            new Spec("Reaction Ball Pro", "Six-sided reaction ball for unpredictable bounces.", "16.99", 4.3, 150),
            new Spec("TRX-Style Suspension Trainer", "Heavy-duty suspension trainer with door anchor and carry bag.", "89.00", 4.6, 38),
            new Spec("Medicine Ball 6kg", "Soft-grip medicine ball with textured outer for confident handling.", "39.99", 4.5, 60),
            new Spec("Speed Parachute Trainer", "Adjustable resistance parachute for sprint training.", "29.99", 4.3, 70),
            new Spec("Sled Pull Strap & Harness", "Padded harness and strap rig for sled pulls and pushes.", "49.99", 4.4, 45),
            new Spec("Sand-Filled Power Bag 20kg", "Multi-handle power bag for carries, slams and conditioning.", "89.99", 4.6, 22),
            new Spec("Slam Ball Set 4/6/8 kg", "Three-piece slam ball set with no-bounce textured shell.", "119.00", 4.5, 18),
            new Spec("Vertical Jump Mat", "Switch-mat vertical jump tester with digital display.", "199.00", 4.6, 9),
            new Spec("Stopwatch & Whistle Combo", "Coach kit with stopwatch, whistle and lanyard.", "14.99", 4.4, 200),
            new Spec("Fan Bike Air Trainer", "Air-resistance bike with adjustable seat and console.", "499.00", 4.5, 7),
            new Spec("Ankle Resistance Bands", "Pair of ankle loops for hip and glute activation work.", "19.99", 4.4, 160),
            new Spec("Reflex Reaction Strobe Glasses", "Strobe glasses train visual reaction speed in 8 modes.", "149.00", 4.5, 12),
            new Spec("Suspension Anchor Strap", "Door anchor and tree strap for outdoor suspension training.", "17.99", 4.3, 130),
            new Spec("Training Bib Set (10 pcs)", "Reversible mesh bibs in five sizes with mesh bag.", "29.99", 4.4, 90)
    };

    private static final Spec[] ACCESSORIES_SPECS = {
            new Spec("HydroFlow 1L Water Bottle", "Vacuum-insulated stainless bottle, leakproof flip cap.", "29.99", 4.6, 200),
            new Spec("Trainer Gym Backpack 30L", "Wet/dry compartment, padded laptop sleeve and ventilated shoe pocket.", "69.00", 4.5, 50),
            new Spec("Performance Sport Watch", "GPS multi-sport watch with heart-rate and 14-day battery life.", "249.00", 4.7, 18),
            new Spec("Quick-Dry Sport Towel", "Microfibre towel that dries 3x faster than cotton.", "14.99", 4.3, 220),
            new Spec("Wireless Sport Earbuds", "IPX7 sweat-proof earbuds with 30h total battery life.", "89.00", 4.5, 60),
            new Spec("Compact Foam Roller", "Travel-size 30cm foam roller for warm-ups and recovery.", "19.99", 4.4, 130),
            new Spec("Sweat-Wicking Headband", "Pack of three moisture-wicking headbands.", "12.99", 4.3, 200),
            new Spec("Insulated 750ml Bottle", "Slim 750ml stainless bottle keeps cold for 24 hours.", "24.99", 4.5, 180),
            new Spec("Athletic Wristband Set", "Pair of cotton terry wristbands, soft and absorbent.", "9.99", 4.2, 240),
            new Spec("Sports Sunglasses UV400", "Polarised sport sunglasses with anti-slip nose pads.", "49.99", 4.5, 70),
            new Spec("Foldable Tote Gym Bag", "Packable 25L gym tote with shoe compartment.", "34.99", 4.4, 100),
            new Spec("Bluetooth Sport Speaker", "Compact IPX5 Bluetooth speaker with carabiner clip.", "39.99", 4.4, 85),
            new Spec("Compression Shin Sleeves", "Targeted compression for warmup and recovery.", "19.99", 4.4, 150),
            new Spec("Knee Stabilizer Brace", "Hinged knee brace with breathable neoprene wrap.", "39.99", 4.5, 65),
            new Spec("Antibacterial Mouth Guard", "Boil-and-bite mouth guard with antimicrobial layer.", "14.99", 4.3, 180),
            new Spec("Compression Arm Sleeve", "Sweat-wicking compression sleeve with UV protection.", "17.99", 4.3, 200),
            new Spec("Heart Rate Monitor Strap", "Bluetooth & ANT+ chest strap heart-rate monitor.", "79.00", 4.6, 35),
            new Spec("Sport Cap Adjustable", "Lightweight running/tennis cap with sweatband.", "19.99", 4.4, 220),
            new Spec("Travel Toiletry Sport Kit", "Hanging toiletry kit with mesh pockets and water-resistant base.", "24.99", 4.4, 110),
            new Spec("Lifting Hooks Pair", "Padded steel lifting hooks with non-slip neoprene wrap.", "22.99", 4.5, 95)
    };
}
