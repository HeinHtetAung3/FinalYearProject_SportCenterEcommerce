-- V7: catalog variants + Lifestyle category.
--
-- Brings the persistent schema in line with the variant-aware catalog the
-- in-memory repo and the frontend already speak. Mirrors the demo
-- dataset in `.frontend/src/data/products.js` (the football boot range
-- and the 50-product Lifestyle line) so the JPA repository can be wired
-- in without losing variant fidelity.
--
-- Adds:
--   * products.brand / gender / subcategory + is_new_arrival /
--     is_best_seller / is_on_sale flags
--   * product_sizes  (footwear EU sizes — multi-row per product)
--   * product_colors (free-form colourway labels — multi-row per product)
--   * product_images (positional gallery — multi-row per product)
--   * Lifestyle category (id 8) with its 50 mirrored products
--   * cart_items.variant_size + variant_color (composite cart-line key)
--   * order_items.variant_size + variant_color (preserve variant on order)
--
-- Safe on a clean DB. On a populated DB the unique-key swap on
-- cart_items briefly drops the (cart_id, product_id) constraint and
-- replaces it with (cart_id, product_id, variant_size, variant_color).
-- The live code path is the in-memory repo today, so this migration
-- only matters once the JPA repository is wired in.

-- ----------------------------------------------------------------------
-- 1. Product metadata columns
-- ----------------------------------------------------------------------

ALTER TABLE products ADD COLUMN brand          VARCHAR(80)  NULL;
ALTER TABLE products ADD COLUMN gender         VARCHAR(16)  NULL;
ALTER TABLE products ADD COLUMN subcategory    VARCHAR(40)  NULL;
ALTER TABLE products ADD COLUMN is_new_arrival BOOLEAN      NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN is_best_seller BOOLEAN      NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN is_on_sale     BOOLEAN      NOT NULL DEFAULT FALSE;

CREATE INDEX idx_products_brand       ON products(brand);
CREATE INDEX idx_products_gender      ON products(gender);
CREATE INDEX idx_products_subcategory ON products(subcategory);

-- ----------------------------------------------------------------------
-- 2. Variant tables
-- ----------------------------------------------------------------------

CREATE TABLE product_sizes (
    product_id BIGINT NOT NULL,
    eu_size    INT    NOT NULL,
    PRIMARY KEY (product_id, eu_size),
    CONSTRAINT fk_product_sizes_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_colors (
    product_id BIGINT       NOT NULL,
    label      VARCHAR(60)  NOT NULL,
    PRIMARY KEY (product_id, label),
    CONSTRAINT fk_product_colors_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE product_images (
    product_id BIGINT       NOT NULL,
    position   INT          NOT NULL,
    url        VARCHAR(500) NOT NULL,
    PRIMARY KEY (product_id, position),
    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------
-- 3. Lifestyle category
-- ----------------------------------------------------------------------

INSERT INTO categories(id, name, slug) VALUES (8, 'Lifestyle', 'lifestyle');

-- ----------------------------------------------------------------------
-- 4. Football boot variants
--
-- Three V6 boots (FBL-001, FBL-005, FBL-012) get brand attribution, EU
-- size runs and four-image galleries — same shape the frontend's
-- `footballProducts` array exposes for the boot detail page.
-- ----------------------------------------------------------------------

UPDATE products SET brand = 'Adidas' WHERE sku = 'FBL-001';
UPDATE products SET brand = 'Nike'   WHERE sku = 'FBL-005';
UPDATE products SET brand = 'Puma'   WHERE sku = 'FBL-012';

INSERT INTO product_sizes(product_id, eu_size)
SELECT p.id, s.eu_size
FROM products p
CROSS JOIN (
    SELECT 40 AS eu_size UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44
) s
WHERE p.sku IN ('FBL-001', 'FBL-005', 'FBL-012');

INSERT INTO product_colors(product_id, label)
SELECT p.id, c.label
FROM products p
JOIN (
    SELECT 'FBL-001' AS sku, 'Solar Red'    AS label UNION ALL
    SELECT 'FBL-001',         'Core Black'         UNION ALL
    SELECT 'FBL-001',         'Cloud White'        UNION ALL
    SELECT 'FBL-005',         'Volt / Black'       UNION ALL
    SELECT 'FBL-005',         'Crimson'            UNION ALL
    SELECT 'FBL-005',         'Sapphire Blue'      UNION ALL
    SELECT 'FBL-012',         'Neon Yellow'        UNION ALL
    SELECT 'FBL-012',         'Pink Glo'           UNION ALL
    SELECT 'FBL-012',         'Deep Navy'
) c ON c.sku = p.sku;

INSERT INTO product_images(product_id, position, url)
SELECT p.id, g.position, g.url
FROM products p
JOIN (
    SELECT 'FBL-001' AS sku, 1 AS position, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80' AS url UNION ALL
    SELECT 'FBL-001', 2, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-001', 3, 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-001', 4, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-005', 1, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-005', 2, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-005', 3, 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-005', 4, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-012', 1, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-012', 2, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-012', 3, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80' UNION ALL
    SELECT 'FBL-012', 4, 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80'
) g ON g.sku = p.sku;

-- ----------------------------------------------------------------------
-- 5. Lifestyle products (50 items mirrored from products.js)
--
-- IDs 141..190 are reserved here to mirror `lifestyleProducts` in
-- `.frontend/src/data/products.js`. AUTO_INCREMENT is bumped past 190
-- afterwards so future inserts do not collide.
--
-- Subcategories: Sneakers (141-152), Hoodies (153-162), T-Shirts
-- (163-170), Joggers (171-178), Caps (179-184), Bags (185-190).
-- ----------------------------------------------------------------------

INSERT INTO products(
    id, category_id, name, sku, description,
    price, stock_quantity, average_rating,
    image_url, brand, gender, subcategory
) VALUES
    -- Sneakers
    (141, 8, 'Heritage Court Lo Sneaker',                'LIF-001', 'Low-cut court silhouette in soft full-grain leather with a vulcanised cupsole and tonal three-stripe overlays.',     89.99,  42, 4.6, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Sneakers'),
    (142, 8, 'Originals Trefoil Lo Lifestyle Sneaker',   'LIF-002', 'Clean white leather upper with perforated three-stripes and a slim rubber outsole. Iconic off-duty silhouette.',       79.99,  38, 4.5, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Sneakers'),
    (143, 8, 'Gazelle Heritage Trainer',                 'LIF-003', 'Suede-wrapped retro trainer with a gum rubber outsole and contrast T-toe panel. Reissued from the archive.',          94.99,  24, 4.7, 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Sneakers'),
    (144, 8, 'Samba Classic Lifestyle Shoe',             'LIF-004', 'Heritage indoor-football silhouette reborn for the street. Smooth leather upper, suede T-toe and gum sole.',         109.99,  19, 4.8, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Sneakers'),
    (145, 8, 'Forum Lo Premium Sneaker',                 'LIF-005', 'Low-top hoops-inspired sneaker with hook-and-loop ankle strap, full-grain leather panels and EVA midsole.',         119.99,  17, 4.6, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Sneakers'),
    (146, 8, 'NMD Streetwear Runner',                    'LIF-006', 'Modern lifestyle runner with sock-fit Primeknit upper, signature midsole plugs and Boost cushioning.',               129.99,  22, 4.7, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Sneakers'),
    (147, 8, 'Ozweego Chunky Sneaker',                   'LIF-007', 'Bold chunky silhouette pieced together from layered mesh, nubuck and reflective overlays.',                          139.99,  14, 4.5, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Sneakers'),
    (148, 8, 'Superstar Heritage Sneaker',               'LIF-008', 'The original shell-toe court icon. Leather upper, classic three-stripe panel and a rubber cupsole.',                  99.99,  31, 4.7, 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Sneakers'),
    (149, 8, 'Continental 80 Retro Sneaker',             'LIF-009', 'Slim, low-profile court trainer reissued from the 80s archive with pastel three-stripe accents.',                     84.99,  26, 4.4, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Sneakers'),
    (150, 8, 'ZX Flux Lifestyle Runner',                 'LIF-010', 'Streamlined lifestyle runner with stretch mesh upper, welded TPU cage and TORSION shank.',                            99.99,  28, 4.4, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Sneakers'),
    (151, 8, 'Forum Mid Street Sneaker',                 'LIF-011', 'Mid-cut hoops silhouette with elastic ankle strap, padded collar and contrast suede heel patch.',                   109.99,  21, 4.5, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Sneakers'),
    (152, 8, 'Originals Trefoil Kids Sneaker',           'LIF-012', 'Classic kids low-top in soft synthetic leather with hook-and-loop straps and flexible rubber outsole.',               59.99,  50, 4.6, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Kids',   'Sneakers'),

    -- Hoodies
    (153, 8, 'Trefoil Logo Pullover Hoodie',             'LIF-013', 'Brushed-back fleece pullover hoodie with a kangaroo pocket and flock-printed trefoil chest logo.',                    69.99,  60, 4.6, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Hoodies'),
    (154, 8, 'Essentials Crew Sweatshirt',               'LIF-014', 'Soft cotton-blend crew with ribbed cuffs and hem and a small embroidered logo on the chest.',                         54.99,  80, 4.5, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Hoodies'),
    (155, 8, 'Trefoil Pullover Hoodie',                  'LIF-015', 'Mid-weight french terry hoodie with a slightly cropped hem, drop shoulders and embroidered trefoil.',                 64.99,  55, 4.6, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Hoodies'),
    (156, 8, '3-Stripes Fleece Hoodie',                  'LIF-016', 'Heritage three-stripe fleece hoodie with rubber wordmark on the sleeve and a soft brushed inner.',                    74.99,  44, 4.7, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Hoodies'),
    (157, 8, 'Sportswear Premium Hoodie',                'LIF-017', 'Heavyweight cotton hoodie with tonal flock logo, ribbed details and a generous oversized fit.',                       79.99,  30, 4.6, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Hoodies'),
    (158, 8, 'Future Icons Half-Zip',                    'LIF-018', 'Smooth interlock half-zip with a stand collar and reflective brand mark on the chest.',                                69.99,  36, 4.5, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Hoodies'),
    (159, 8, 'Adicolor Cropped Hoodie',                  'LIF-019', 'Cropped pullover hoodie with three-stripe sleeves and a heritage trefoil logo.',                                       59.99,  42, 4.5, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Hoodies'),
    (160, 8, 'Kids Trefoil Crew Sweatshirt',             'LIF-020', 'Soft cotton-fleece crewneck for kids with a printed trefoil chest logo and ribbed hem and cuffs.',                     39.99,  80, 4.5, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Kids',   'Hoodies'),
    (161, 8, 'Lifestyle Quarter-Zip Hoodie',             'LIF-021', 'Mid-layer quarter-zip hoodie with brushed-back jersey, raglan sleeves and tonal embroidered logo.',                    64.99,  30, 4.4, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Hoodies'),
    (162, 8, 'Premium Tonal Logo Hoodie',                'LIF-022', 'Heavyweight 480 GSM hoodie with embroidered tonal three-stripe and trefoil. Substantial drape, dropped shoulders.',    89.99,  22, 4.7, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Hoodies'),

    -- T-Shirts
    (163, 8, 'Trefoil Logo Tee',                         'LIF-023', 'Classic regular-fit cotton tee with a printed trefoil logo on the chest. Ribbed crew neck.',                            29.99, 120, 4.5, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'T-Shirts'),
    (164, 8, 'Adicolor Classic Tee',                     'LIF-024', 'Slim-fit cotton tee with a heritage trefoil at the chest and a slightly shorter body length.',                          32.99,  90, 4.5, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'T-Shirts'),
    (165, 8, 'Sportswear Linear Tee',                    'LIF-025', 'Soft cotton tee with a rubber-print linear wordmark across the chest. Standard fit, ribbed crew neck.',                 24.99, 130, 4.4, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'T-Shirts'),
    (166, 8, 'Cropped Trefoil Tee',                      'LIF-026', 'Cropped boxy-fit cotton tee with three-stripe shoulders and a tonal trefoil chest hit.',                                 29.99,  80, 4.4, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'T-Shirts'),
    (167, 8, 'Future Icons Performance Tee',             'LIF-027', 'AEROREADY interlock tee with satin print logo at the chest and slightly extended back hem.',                            34.99,  70, 4.5, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'T-Shirts'),
    (168, 8, 'Kids Adicolor Tee',                        'LIF-028', 'Soft cotton kids tee with three-stripe sleeves and a flock trefoil chest hit. Easy-care, machine washable.',             19.99, 110, 4.5, 'https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Kids',   'T-Shirts'),
    (169, 8, 'Premium Heavy Logo Tee',                   'LIF-029', 'Heavyweight 240 GSM cotton tee with double-stitched seams and an embroidered chest logo.',                              39.99,  55, 4.6, 'https://images.unsplash.com/photo-1487466365202-1afdb86c764e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'T-Shirts'),
    (170, 8, 'Heritage Striped Tee',                     'LIF-030', 'Yarn-dyed striped cotton tee with a small chest logo and a lightly cropped silhouette.',                                34.99,  65, 4.4, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'T-Shirts'),

    -- Joggers
    (171, 8, 'Adicolor Classic Joggers',                 'LIF-031', 'Heritage tricot track pants with three-stripe leg trim, ribbed cuffs and an elastic drawcord waist.',                  59.99,  70, 4.6, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Joggers'),
    (172, 8, '3-Stripes Cuffed Track Pants',             'LIF-032', 'Cotton-blend cuffed pants with embroidered three-stripes down the leg and a soft brushed-back inner.',                  54.99,  85, 4.5, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Joggers'),
    (173, 8, 'Sportswear Lounge Joggers',                'LIF-033', 'High-rise lounge joggers in french terry with side pockets, wide elastic waistband and tapered fit.',                   64.99,  60, 4.5, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Joggers'),
    (174, 8, 'Trefoil Cargo Pants',                      'LIF-034', 'Loose-fit cargo joggers with bellowed thigh pockets, drawcord waist and embroidered branding above the cuff.',          74.99,  36, 4.5, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Joggers'),
    (175, 8, 'Premium Tapered Pants',                    'LIF-035', 'Smooth jersey pants with tapered leg, hidden zip pockets and a clean tonal logo at the thigh.',                          69.99,  28, 4.6, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Joggers'),
    (176, 8, 'Adicolor Wide-Leg Track Pants',            'LIF-036', 'High-waist wide-leg track pants in soft tricot with three-stripe trim and a clean unbroken hem.',                       69.99,  32, 4.5, 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Joggers'),
    (177, 8, 'Kids Tracksuit Bottoms',                   'LIF-037', 'Soft tricot pants for kids with three-stripe leg trim, elastic waist and ribbed cuffs.',                                 34.99,  90, 4.5, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Kids',   'Joggers'),
    (178, 8, 'Future Icons Performance Joggers',         'LIF-038', 'AEROREADY tapered joggers with mesh pocket bags, extended drawcord waist and reflective brand mark.',                   74.99,  24, 4.6, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Joggers'),

    -- Caps
    (179, 8, 'Trefoil Classic Cap',                      'LIF-039', 'Six-panel cotton baseball cap with a curved brim, embroidered trefoil and adjustable strap-back.',                       24.99, 200, 4.5, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Caps'),
    (180, 8, 'Adicolor Bucket Hat',                      'LIF-040', 'Lightweight cotton-twill bucket hat with a short brim, eyelet vents and tonal three-stripe embroidery.',                 29.99,  70, 4.4, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Caps'),
    (181, 8, 'Sportswear Snapback Cap',                  'LIF-041', 'Structured six-panel snapback with flat brim, raised embroidered logo and adjustable plastic snap closure.',             27.99, 110, 4.4, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Caps'),
    (182, 8, 'Trefoil Beanie',                           'LIF-042', 'Soft acrylic-blend ribbed beanie with a folded cuff and a woven trefoil patch on the front.',                              19.99, 140, 4.4, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Caps'),
    (183, 8, 'Performance Running Cap',                  'LIF-043', 'Lightweight 5-panel running cap with AEROREADY moisture-wicking sweatband and reflective trim.',                          24.99,  95, 4.5, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Men',    'Caps'),
    (184, 8, 'Kids Adventure Cap',                       'LIF-044', 'Soft cotton kids cap with curved brim, embroidered logo and adjustable hook-and-loop back strap.',                        14.99, 160, 4.4, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Kids',   'Caps'),

    -- Bags
    (185, 8, 'Originals Trefoil Backpack',               'LIF-045', 'Classic 23L two-compartment backpack with padded laptop sleeve, front zip pocket and embroidered trefoil.',               44.99,  80, 4.6, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Bags'),
    (186, 8, 'Sportswear Lifestyle Duffel',              'LIF-046', 'Mid-size 35L duffel with separate ventilated shoe compartment, padded shoulder strap and water-resistant base.',          59.99,  45, 4.5, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Bags'),
    (187, 8, 'Mini Crossbody Trefoil Bag',               'LIF-047', 'Compact crossbody with adjustable webbing strap, front zip pocket and embroidered trefoil.',                              34.99,  70, 4.4, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Bags'),
    (188, 8, 'Adicolor Tote Bag',                        'LIF-048', 'Spacious shopper tote in heavy cotton-twill with reinforced double handles and printed trefoil logo.',                    39.99,  60, 4.4, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Women',  'Bags'),
    (189, 8, 'Performance Gym Sack',                     'LIF-049', 'Lightweight drawstring gym sack with ripstop body, reinforced grommet corners and front zip pocket.',                     19.99, 200, 4.4, 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Unisex', 'Bags'),
    (190, 8, 'Kids Trefoil Mini Backpack',               'LIF-050', 'Right-sized 11L kids backpack with padded straps, single main compartment and printed trefoil logo.',                     24.99, 110, 4.5, 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=600&q=80', 'Adidas', 'Kids',   'Bags');

-- Reserve IDs 191..220 for the demo `bonusProducts` lineup in
-- `.frontend/src/data/products.js` so admin-created products start
-- after the mock dataset.
ALTER TABLE products AUTO_INCREMENT = 221;

-- Sneakers (141-152) carry EU sizes 40-44 — apparel sizing for the
-- other lifestyle subcategories will land in a follow-up migration.
INSERT INTO product_sizes(product_id, eu_size)
SELECT p.id, s.eu_size
FROM products p
CROSS JOIN (
    SELECT 40 AS eu_size UNION ALL SELECT 41 UNION ALL SELECT 42 UNION ALL SELECT 43 UNION ALL SELECT 44
) s
WHERE p.id BETWEEN 141 AND 152;

INSERT INTO product_colors(product_id, label) VALUES
    -- Sneakers: three colourways each
    (141, 'Core Black'), (141, 'Cloud White'), (141, 'Sand Strata'),
    (142, 'Cloud White'), (142, 'Pink Tint'),  (142, 'Mint Foam'),
    (143, 'Bold Green'),  (143, 'Core Black'),  (143, 'Burgundy'),
    (144, 'Cloud White'), (144, 'Core Black'),  (144, 'Royal Blue'),
    (145, 'Cloud White'), (145, 'Bliss Lilac'), (145, 'Core Black'),
    (146, 'Core Black'),  (146, 'Solar Red'),   (146, 'Cloud White'),
    (147, 'Pulse Magenta'), (147, 'Core Black'), (147, 'Cloud White'),
    (148, 'Cloud White'), (148, 'Core Black'),  (148, 'Cream'),
    (149, 'Cloud White'), (149, 'Hazy Sky'),    (149, 'Pink Tint'),
    (150, 'Core Black'),  (150, 'Solar Yellow'),(150, 'Cloud White'),
    (151, 'Cloud White'), (151, 'Wonder Beige'),(151, 'Crew Navy'),
    (152, 'Cloud White'), (152, 'Pink Tint'),

    -- Hoodies: two colourways each
    (153, 'Core Black'),  (153, 'Medium Grey Heather'),
    (154, 'Medium Grey Heather'), (154, 'Core Black'),
    (155, 'Pink Tint'),   (155, 'Core Black'),
    (156, 'Core Black'),  (156, 'Cream White'),
    (157, 'Wonder Beige'),(157, 'Core Black'),
    (158, 'Core Black'),  (158, 'Crew Navy'),
    (159, 'Core Black'),  (159, 'Pink Tint'),
    (160, 'Core Black'),  (160, 'Royal Blue'),
    (161, 'Medium Grey Heather'), (161, 'Core Black'),
    (162, 'Core Black'),  (162, 'Cream White'),

    -- T-Shirts: three colourways each
    (163, 'Cloud White'), (163, 'Core Black'),  (163, 'Solar Red'),
    (164, 'Cloud White'), (164, 'Pink Tint'),    (164, 'Core Black'),
    (165, 'Core Black'),  (165, 'Cloud White'),  (165, 'Crew Navy'),
    (166, 'Cloud White'), (166, 'Bliss Lilac'),  (166, 'Core Black'),
    (167, 'Core Black'),  (167, 'Cloud White'),  (167, 'Mint Foam'),
    (168, 'Cloud White'), (168, 'Solar Red'),    (168, 'Royal Blue'),
    (169, 'Cream White'), (169, 'Core Black'),   (169, 'Olive Strata'),
    (170, 'Cream White'), (170, 'Core Black'),   (170, 'Hazy Sky'),

    -- Joggers: two colourways each
    (171, 'Core Black'),  (171, 'Medium Grey Heather'),
    (172, 'Core Black'),  (172, 'Crew Navy'),
    (173, 'Wonder Beige'),(173, 'Core Black'),
    (174, 'Olive Strata'),(174, 'Core Black'),
    (175, 'Core Black'),  (175, 'Cream White'),
    (176, 'Core Black'),  (176, 'Pink Tint'),
    (177, 'Core Black'),  (177, 'Royal Blue'),
    (178, 'Core Black'),  (178, 'Crew Navy'),

    -- Caps: two colourways each
    (179, 'Core Black'),  (179, 'Cloud White'),
    (180, 'Pink Tint'),   (180, 'Core Black'),
    (181, 'Core Black'),  (181, 'Crew Navy'),
    (182, 'Core Black'),  (182, 'Cream White'),
    (183, 'Core Black'),  (183, 'Cloud White'),
    (184, 'Solar Yellow'),(184, 'Core Black'),

    -- Bags: two colourways each
    (185, 'Core Black'),  (185, 'Cloud White'),
    (186, 'Core Black'),  (186, 'Olive Strata'),
    (187, 'Core Black'),  (187, 'Pink Tint'),
    (188, 'Cream White'), (188, 'Core Black'),
    (189, 'Core Black'),  (189, 'Cloud White'),
    (190, 'Pink Tint'),   (190, 'Royal Blue');

INSERT INTO product_images(product_id, position, url)
SELECT id, 1, image_url
FROM products
WHERE id BETWEEN 141 AND 190;

-- ----------------------------------------------------------------------
-- 6. Cart variant columns
--
-- Replace the legacy (cart_id, product_id) uniqueness with a composite
-- line key — same shape as `makeCartLineKey()` in
-- `.frontend/src/utils/storage.js`. Rebuild the table so we do not rely
-- on database-specific names for the old inline UNIQUE index (H2 uses
-- CONSTRAINT_INDEX_*; MySQL naming differs).
-- ----------------------------------------------------------------------

CREATE TABLE cart_items_new (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    variant_size INT NOT NULL DEFAULT 0,
    variant_color VARCHAR(60) NOT NULL DEFAULT '',
    CONSTRAINT uk_cart_items_line UNIQUE (cart_id, product_id, variant_size, variant_color),
    CONSTRAINT fk_cart_items_v7_cart FOREIGN KEY (cart_id) REFERENCES carts(id),
    CONSTRAINT fk_cart_items_v7_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_cart_items_cart ON cart_items_new(cart_id);

INSERT INTO cart_items_new (id, cart_id, product_id, quantity, variant_size, variant_color)
SELECT id, cart_id, product_id, quantity, 0, '' FROM cart_items;

DROP TABLE cart_items;

ALTER TABLE cart_items_new RENAME TO cart_items;

-- ----------------------------------------------------------------------
-- 7. Order variant columns (snapshot — NULL for legacy lines)
-- ----------------------------------------------------------------------

ALTER TABLE order_items ADD COLUMN variant_size  INT         NULL;
ALTER TABLE order_items ADD COLUMN variant_color VARCHAR(60) NULL;
