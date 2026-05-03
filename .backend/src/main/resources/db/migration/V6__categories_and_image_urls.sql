-- V6: align the persistent schema with the in-memory catalog.
--
-- Adds image_url to products, replaces the old 3 categories
-- (Footwear / Balls / Fitness) with the canonical 7 used everywhere in the
-- app, and reseeds 20 products per category (140 total) with same-origin
-- image paths under /images/products/<slug>/. Mirrors
-- InMemoryCatalogRepository.java and .frontend/src/data/mockCatalog.js so
-- the API and the demo-mode fallback always render the same dataset.
--
-- Safe on a clean DB. On a populated DB the DELETEs would orphan
-- cart_items / order_items by FK and should be replaced with a tailored
-- migration; the live code path is the in-memory repo today, so this
-- migration only matters once the JPA repository is wired in.

ALTER TABLE products ADD COLUMN image_url VARCHAR(500);

DELETE FROM products;
DELETE FROM categories;

ALTER TABLE products AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;

INSERT INTO categories(id, name, slug) VALUES
    (1, 'Running', 'running'),
    (2, 'Football', 'football'),
    (3, 'Fitness', 'fitness'),
    (4, 'Outdoor', 'outdoor'),
    (5, 'Basketball', 'basketball'),
    (6, 'Training', 'training'),
    (7, 'Accessories', 'accessories');

INSERT INTO products(category_id, name, sku, description, price, stock_quantity, average_rating, image_url) VALUES
    -- Running (20)
    (1, 'Sprint Pro Running Shoes',           'RUN-001', 'Lightweight, breathable shoes engineered for race-day pace.',           129.99,  24, 4.8, '/images/products/running/running-1.jpg'),
    (1, 'TrailBlaze All-Terrain Trainers',    'RUN-002', 'Aggressive lugs and waterproof upper for unpredictable trails.',        159.00,  18, 4.6, '/images/products/running/running-2.jpg'),
    (1, 'Cloud Glide Marathon Shoes',         'RUN-003', 'Plush long-distance cushioning with rocker geometry.',                  179.50,  14, 4.7, '/images/products/running/running-3.jpg'),
    (1, 'Velocity Race Singlet',              'RUN-004', 'Featherweight, sweat-wicking race singlet with seamless construction.', 39.99,  60, 4.4, '/images/products/running/running-4.jpg'),
    (1, 'Pacemaker Lightweight Trainers',     'RUN-005', 'Daily trainer with springy foam midsole and breathable mesh upper.',   119.00,  30, 4.5, '/images/products/running/running-5.jpg'),
    (1, 'Ridgeline Trail Runners',            'RUN-006', 'Vibram outsole and rock-plate protection for technical trails.',       169.00,  12, 4.6, '/images/products/running/running-6.jpg'),
    (1, 'AirStream Daily Trainer',            'RUN-007', 'Soft heel cradle and forefoot rebound for everyday miles.',            109.99,  40, 4.3, '/images/products/running/running-7.jpg'),
    (1, 'Carbon Plate Race Shoes',            'RUN-008', 'Full-length carbon plate for a measurable race-day boost.',            219.00,   9, 4.9, '/images/products/running/running-8.jpg'),
    (1, 'Featherweight Running Shorts',       'RUN-009', '4-inch quick-dry shorts with built-in liner and back zip pocket.',      34.99,  95, 4.4, '/images/products/running/running-9.jpg'),
    (1, 'Reflective Run Vest',                'RUN-010', '360-degree reflectivity and adjustable fit for low-light runs.',        49.99,  55, 4.5, '/images/products/running/running-10.jpg'),
    (1, 'Compression Calf Sleeves',           'RUN-011', 'Graduated compression to support stride and recovery.',                 22.99, 130, 4.3, '/images/products/running/running-11.jpg'),
    (1, 'Hi-Vis Running Cap',                 'RUN-012', 'Featherweight cap with sweatband and reflective trim.',                 19.99, 200, 4.2, '/images/products/running/running-12.jpg'),
    (1, 'Quick-Dry Running Tee',              'RUN-013', 'Anti-odor mesh tee with flatlock seams and laser-cut vents.',           29.99, 150, 4.4, '/images/products/running/running-13.jpg'),
    (1, 'Long-Distance Running Tights',       'RUN-014', 'Compression tights with reflective taping and side pockets.',           79.00,  40, 4.5, '/images/products/running/running-14.jpg'),
    (1, 'Pro-Cushion Running Socks (3-Pack)', 'RUN-015', 'Targeted cushioning, arch support and seamless toes.',                  24.99, 220, 4.6, '/images/products/running/running-15.jpg'),
    (1, 'Thermal Running Jacket',             'RUN-016', 'Brushed inner face traps heat without bulk; water-resistant shell.',   119.00,  28, 4.5, '/images/products/running/running-16.jpg'),
    (1, 'Ergonomic Running Belt',             'RUN-017', 'Bounce-free running belt with phone pocket and gel loops.',             27.99, 110, 4.4, '/images/products/running/running-17.jpg'),
    (1, 'Hydration Running Vest 5L',          'RUN-018', 'Soft flask-friendly running vest for half-marathon and beyond.',        89.99,  22, 4.6, '/images/products/running/running-18.jpg'),
    (1, 'Anti-Blister Run Insoles',           'RUN-019', 'Heat-moldable insoles with metatarsal pad and arch support.',           39.99,  80, 4.4, '/images/products/running/running-19.jpg'),
    (1, 'Night Run LED Armband',              'RUN-020', 'USB-rechargeable LED armband with 3 modes for visibility.',             17.99, 180, 4.3, '/images/products/running/running-20.jpg'),

    -- Football (20)
    (2, 'Velocity X Studded Football Boots',  'FBL-001', 'Soft synthetic upper with precision-stud configuration.',              189.50,  12, 4.7, '/images/products/football/football-1.jpg'),
    (2, 'Match Day Pro Football',             'FBL-002', 'FIFA-approved match ball with thermo-bonded panels.',                   39.99,  60, 4.4, '/images/products/football/football-2.jpg'),
    (2, 'Goalkeeper Elite Gloves',            'FBL-003', 'Latex palm with finger-spine protection.',                              64.00,  28, 4.5, '/images/products/football/football-3.jpg'),
    (2, 'Pitch Shin Guards',                  'FBL-004', 'Lightweight carbon shin guards with breathable padded sleeves.',        29.99,  75, 4.3, '/images/products/football/football-4.jpg'),
    (2, 'Tactic Astro-Turf Boots',            'FBL-005', 'Multi-stud rubber outsole for grip on artificial grass.',              119.00,  35, 4.4, '/images/products/football/football-5.jpg'),
    (2, 'Pro Training Football',              'FBL-006', 'Hand-stitched training ball built for daily repetition.',               24.99, 120, 4.3, '/images/products/football/football-6.jpg'),
    (2, 'Stadium Replica Jersey',             'FBL-007', 'Breathable replica jersey with team-color crest detailing.',            79.00,  50, 4.5, '/images/products/football/football-7.jpg'),
    (2, 'Captain Armband Set',                'FBL-008', 'Soft-touch captain armband with hook-and-loop closure (3 sizes).',      12.99, 200, 4.2, '/images/products/football/football-8.jpg'),
    (2, 'Match-Grade Goalkeeper Jersey',      'FBL-009', 'Padded elbows and breathable mesh panels for keepers.',                 89.00,  22, 4.5, '/images/products/football/football-9.jpg'),
    (2, 'Pro Football Socks',                 'FBL-010', 'Compression cushioning with anti-slip pads and arch support.',          19.99, 180, 4.4, '/images/products/football/football-10.jpg'),
    (2, 'Goalkeeper Padded Pants',            'FBL-011', 'Hip and thigh padding with reinforced knees for diving training.',      54.99,  30, 4.3, '/images/products/football/football-11.jpg'),
    (2, 'Carbon Stud Boots Pro',              'FBL-012', 'Precision-engineered carbon plate for explosive turns.',               229.00,   8, 4.8, '/images/products/football/football-12.jpg'),
    (2, 'Coach Whistle and Lanyard Pack',     'FBL-013', 'Pea-less coach whistle with lanyard and finger grip.',                   9.99, 240, 4.4, '/images/products/football/football-13.jpg'),
    (2, 'Tactical Coach Board',               'FBL-014', 'Magnetic coach board with dry-erase pitch and player magnets.',         39.99,  45, 4.5, '/images/products/football/football-14.jpg'),
    (2, 'Speed Ladder for Football Drills',   'FBL-015', '4m flat-rung ladder for sprint and footwork training.',                 24.99,  90, 4.4, '/images/products/football/football-15.jpg'),
    (2, 'Football Pump and Needle Kit',       'FBL-016', 'Dual-action pump with pressure gauge and 4 needles.',                   14.99, 160, 4.3, '/images/products/football/football-16.jpg'),
    (2, 'Mini Pop-Up Goal Set',               'FBL-017', 'Pair of pop-up training goals (1.5m) with carry bag.',                  49.99,  60, 4.4, '/images/products/football/football-17.jpg'),
    (2, 'Striker Training Vest',              'FBL-018', 'Reversible mesh vest set (10 pcs) in two colors.',                      34.99,  75, 4.3, '/images/products/football/football-18.jpg'),
    (2, 'Pro Match Corner Flags (Set of 4)',  'FBL-019', 'Spring-loaded corner flags with weighted base.',                        24.99, 100, 4.2, '/images/products/football/football-19.jpg'),
    (2, 'Match Ball Carry Net',               'FBL-020', 'Heavy-duty net carries up to 12 size-5 footballs.',                     17.99, 110, 4.4, '/images/products/football/football-20.jpg'),

    -- Fitness (20)
    (3, 'Core Strength Kettlebell 16kg',      'FIT-001', 'Cast-iron kettlebell ideal for swings, presses and conditioning.',      64.99,  40, 4.7, '/images/products/fitness/fitness-1.jpg'),
    (3, 'PowerForge Adjustable Dumbbells',    'FIT-002', 'Quick-select dumbbells from 5 to 50 lbs. Replaces 15 pairs.',          349.00,  14, 4.8, '/images/products/fitness/fitness-2.jpg'),
    (3, 'IronCore Olympic Barbell 20kg',      'FIT-003', 'Knurled, dual-marked Olympic barbell rated for 1500 lb.',              279.00,   6, 4.9, '/images/products/fitness/fitness-3.jpg'),
    (3, 'FlexGrip Premium Yoga Mat',          'FIT-004', 'Non-slip 6mm yoga mat with closed-cell sweat-resistant surface.',       49.50,  80, 4.5, '/images/products/fitness/fitness-4.jpg'),
    (3, 'Hex Rubber Dumbbell Pair 10kg',      'FIT-005', 'Rubber-coated hex dumbbells with chrome-plated handles.',               89.99,  38, 4.6, '/images/products/fitness/fitness-5.jpg'),
    (3, 'Olympic Bumper Plate Set',           'FIT-006', 'Color-coded bumper plates designed for explosive lifts.',              449.00,   9, 4.8, '/images/products/fitness/fitness-6.jpg'),
    (3, 'EZ-Curl Bar 1.2m',                   'FIT-007', 'Steel curl bar with diamond knurling and rotating sleeves.',            79.00,  25, 4.5, '/images/products/fitness/fitness-7.jpg'),
    (3, 'Adjustable Weight Bench',            'FIT-008', 'Seven-position bench rated to 300 kg.',                                219.00,  17, 4.6, '/images/products/fitness/fitness-8.jpg'),
    (3, 'Compact Power Rack',                 'FIT-009', 'Half-rack with safety arms, J-cups and pull-up bar.',                  599.00,   4, 4.7, '/images/products/fitness/fitness-9.jpg'),
    (3, 'Wall Ball 9kg',                      'FIT-010', 'Soft-shell wall ball with 14-inch diameter.',                           49.99,  40, 4.5, '/images/products/fitness/fitness-10.jpg'),
    (3, 'Slam Ball 12kg',                     'FIT-011', 'Sand-filled slam ball with no-bounce, grippy textured shell.',          59.99,  32, 4.6, '/images/products/fitness/fitness-11.jpg'),
    (3, 'Foam Roller 90cm',                   'FIT-012', 'High-density EVA foam roller for myofascial release.',                  34.99, 110, 4.5, '/images/products/fitness/fitness-12.jpg'),
    (3, 'Massage Gun Pro',                    'FIT-013', 'Percussive therapy massager with 6 heads and quiet brushless motor.',  149.00,  28, 4.7, '/images/products/fitness/fitness-13.jpg'),
    (3, 'Cushioned Yoga Block (Pair)',        'FIT-014', 'Anti-slip EVA blocks for support in deeper poses.',                     19.99, 200, 4.4, '/images/products/fitness/fitness-14.jpg'),
    (3, 'Weighted Vest 10kg',                 'FIT-015', 'Adjustable weighted vest with reflective trim for conditioning.',       89.00,  25, 4.5, '/images/products/fitness/fitness-15.jpg'),
    (3, 'Lifting Belt with Lever',            'FIT-016', '10mm leather lifting belt with quick-release lever buckle.',            79.00,  30, 4.7, '/images/products/fitness/fitness-16.jpg'),
    (3, 'Wrist Wraps Pro',                    'FIT-017', 'Heavy-duty wrist wraps with thumb loop and IPF approval.',              24.99, 130, 4.5, '/images/products/fitness/fitness-17.jpg'),
    (3, 'Pull-Up Doorway Bar',                'FIT-018', 'No-screw doorway pull-up bar with foam grips, holds 130 kg.',           39.99,  70, 4.4, '/images/products/fitness/fitness-18.jpg'),
    (3, 'Boxing Heavy Bag 35kg',              'FIT-019', 'Pre-filled synthetic-leather heavy bag with chain anchors.',           169.00,  15, 4.6, '/images/products/fitness/fitness-19.jpg'),
    (3, 'Cable Tricep Rope Attachment',       'FIT-020', 'Heavy-duty rope attachment with non-slip rubber ends.',                 19.99,  90, 4.5, '/images/products/fitness/fitness-20.jpg'),

    -- Outdoor (20)
    (4, 'Summit 40L Hiking Pack',             'OUT-001', 'Ergonomic 40L pack with adjustable torso and rain cover.',             129.00,  22, 4.6, '/images/products/outdoor/outdoor-1.jpg'),
    (4, 'TrailLite 2-Person Tent',            'OUT-002', 'Freestanding 3-season tent under 2.4 kg with full-coverage rainfly.', 219.00,  11, 4.7, '/images/products/outdoor/outdoor-2.jpg'),
    (4, 'AlpineDown Sleeping Bag',            'OUT-003', '650-fill down bag rated to -7C, packs small without losing loft.',    189.99,  17, 4.5, '/images/products/outdoor/outdoor-3.jpg'),
    (4, 'Carbon Trekking Poles',              'OUT-004', 'Featherweight foldable carbon poles with cork grips.',                  89.00,  35, 4.4, '/images/products/outdoor/outdoor-4.jpg'),
    (4, 'WaterShed Hiking Boots',             'OUT-005', 'Waterproof leather hiking boots with Vibram outsole.',                 159.00,  20, 4.6, '/images/products/outdoor/outdoor-5.jpg'),
    (4, 'Compact Camp Stove',                 'OUT-006', 'Single-burner backpacking stove with auto-ignition.',                   49.99,  60, 4.5, '/images/products/outdoor/outdoor-6.jpg'),
    (4, '800ml Insulated Trail Mug',          'OUT-007', 'Vacuum-insulated stainless mug keeps coffee hot for 6 hours.',          24.99, 140, 4.4, '/images/products/outdoor/outdoor-7.jpg'),
    (4, 'Lightweight Camp Chair',             'OUT-008', 'Foldable aluminum camp chair, 1.1 kg, holds 130 kg.',                   79.00,  35, 4.5, '/images/products/outdoor/outdoor-8.jpg'),
    (4, 'Headlamp 600 Lumen',                 'OUT-009', 'USB-rechargeable headlamp with red night mode and 30h runtime.',        39.99,  95, 4.5, '/images/products/outdoor/outdoor-9.jpg'),
    (4, 'Hardshell Mountain Jacket',          'OUT-010', 'Waterproof, breathable hardshell with helmet-compatible hood.',        229.00,  14, 4.7, '/images/products/outdoor/outdoor-10.jpg'),
    (4, 'Compass Pro',                        'OUT-011', 'Sighting compass with adjustable declination and clinometer.',          29.99, 120, 4.4, '/images/products/outdoor/outdoor-11.jpg'),
    (4, 'Multi-Tool Hiking Knife',            'OUT-012', '14-in-1 multi-tool with locking blade and rescue hook.',                59.99,  80, 4.6, '/images/products/outdoor/outdoor-12.jpg'),
    (4, 'Inflatable Sleeping Pad',            'OUT-013', '4-season insulated pad with R-value 4.2, packs to 18cm.',               99.00,  28, 4.5, '/images/products/outdoor/outdoor-13.jpg'),
    (4, 'Quick-Set Bivy Shelter',             'OUT-014', 'Single-pole bivy shelter for fast-and-light overnighters.',            149.00,  12, 4.4, '/images/products/outdoor/outdoor-14.jpg'),
    (4, 'Trekking Daypack 25L',               'OUT-015', 'Lightweight daypack with hipbelt and hydration sleeve.',                79.00,  50, 4.5, '/images/products/outdoor/outdoor-15.jpg'),
    (4, 'Solar Camp Lantern',                 'OUT-016', 'Collapsible solar/USB lantern with 200 lumens and 50h runtime.',        34.99,  90, 4.4, '/images/products/outdoor/outdoor-16.jpg'),
    (4, 'Weatherproof Map Case',              'OUT-017', 'Roll-top dry case fits topographic maps; lanyard included.',            19.99, 140, 4.3, '/images/products/outdoor/outdoor-17.jpg'),
    (4, 'UltraLite Backpacking Cookset',      'OUT-018', '4-piece anodized cookset packs into a 1L pot.',                         49.99,  40, 4.5, '/images/products/outdoor/outdoor-18.jpg'),
    (4, 'Thermal Hiking Socks (Pair)',        'OUT-019', 'Merino wool blend socks with reinforced heel and toe.',                 22.99, 180, 4.6, '/images/products/outdoor/outdoor-19.jpg'),
    (4, 'Bear-Resistant Food Container',      'OUT-020', 'IGBC-approved 5L bear canister for backcountry trips.',                 89.99,  22, 4.5, '/images/products/outdoor/outdoor-20.jpg'),

    -- Basketball (20)
    (5, 'Court King Basketball Shoes',        'BBL-001', 'High-cut ankle support, herringbone traction and full-length cushioning.', 145.00,  9, 4.5, '/images/products/basketball/basketball-1.jpg'),
    (5, 'Slam Dunk Indoor Basketball',        'BBL-002', 'Composite leather basketball with deep channels for grip and control.',   49.99, 45, 4.6, '/images/products/basketball/basketball-2.jpg'),
    (5, 'Pro Hoop Compression Sleeve',        'BBL-003', 'Targeted compression and padded forearm panel.',                          24.00, 90, 4.2, '/images/products/basketball/basketball-3.jpg'),
    (5, 'Driveway Hoop System',               'BBL-004', 'Adjustable 7-10 ft pole-mounted hoop with shatter-resistant backboard.', 399.00,  5, 4.6, '/images/products/basketball/basketball-4.jpg'),
    (5, 'Outdoor Street Basketball',          'BBL-005', 'Rubber-cover outdoor ball built for asphalt and concrete.',               29.99, 110, 4.4, '/images/products/basketball/basketball-5.jpg'),
    (5, 'Hi-Top Court Shoes',                 'BBL-006', 'Hi-top court shoes with full-length air cushioning.',                    159.00,  18, 4.7, '/images/products/basketball/basketball-6.jpg'),
    (5, 'Premium Leather Game Ball',          'BBL-007', 'Full-grain leather game ball, indoor use only.',                          79.99,  25, 4.7, '/images/products/basketball/basketball-7.jpg'),
    (5, 'Mini Indoor Hoop Set',               'BBL-008', 'Over-the-door mini hoop with breakaway rim and foam ball.',               34.99,  80, 4.4, '/images/products/basketball/basketball-8.jpg'),
    (5, 'Basketball Training Headband',       'BBL-009', 'Sweat-wicking headband with reflective trim.',                            12.99, 200, 4.3, '/images/products/basketball/basketball-9.jpg'),
    (5, 'Knee Pads Pro',                      'BBL-010', 'Anti-slip silicone grip and EVA cushioning protect during dives.',        29.99,  75, 4.5, '/images/products/basketball/basketball-10.jpg'),
    (5, 'Ball Pump with Gauge',               'BBL-011', 'Dual-action pump with pressure gauge and 3 needles.',                     14.99, 150, 4.4, '/images/products/basketball/basketball-11.jpg'),
    (5, 'Court Cleaning Mop',                 'BBL-012', 'Microfiber court mop with extendable handle for hardwood floors.',        49.99,  30, 4.4, '/images/products/basketball/basketball-12.jpg'),
    (5, 'Heavy-Duty Net Replacement',         'BBL-013', 'All-weather nylon net resists fraying in rain and sun.',                  14.99, 220, 4.3, '/images/products/basketball/basketball-13.jpg'),
    (5, 'Adjustable Backboard Pad',           'BBL-014', 'Reduces shock and protects players around the rim.',                      89.00,  18, 4.5, '/images/products/basketball/basketball-14.jpg'),
    (5, 'Resistance Dribble Goggles',         'BBL-015', 'Restrict downward vision to develop dribble feel.',                       24.99,  95, 4.3, '/images/products/basketball/basketball-15.jpg'),
    (5, 'Pro Shooting Sleeve',                'BBL-016', 'Compression shooting sleeve with elbow padding.',                         22.99, 130, 4.4, '/images/products/basketball/basketball-16.jpg'),
    (5, 'Basketball Carry Bag (Holds 6)',     'BBL-017', 'Heavy-duty mesh carry bag with reinforced straps.',                       34.99,  65, 4.4, '/images/products/basketball/basketball-17.jpg'),
    (5, 'Anti-Slip Grip Spray',               'BBL-018', 'Tacky shoe-grip spray restores court traction in seconds.',               17.99, 140, 4.2, '/images/products/basketball/basketball-18.jpg'),
    (5, 'Wall-Mounted Hoop Bracket',          'BBL-019', 'Steel mounting bracket fits standard backboards.',                       119.00,  14, 4.5, '/images/products/basketball/basketball-19.jpg'),
    (5, 'Tournament Scoreboard',              'BBL-020', 'Portable LED scoreboard with shot clock and remote.',                    299.00,   6, 4.6, '/images/products/basketball/basketball-20.jpg'),

    -- Training (20) — reuses fitness images 21..40
    (6, 'Agility Speed Ladder',               'TRN-001', '4m flat-rung speed ladder with carry bag for footwork drills.',          24.99, 110, 4.5, '/images/products/fitness/fitness-21.jpg'),
    (6, 'Plyo Box Set 20/24/30',              'TRN-002', '3-in-1 wooden plyometric box for box jumps and step-ups.',             169.00,  19, 4.7, '/images/products/fitness/fitness-22.jpg'),
    (6, 'Resistance Band Bundle',             'TRN-003', 'Five graduated loop bands plus door anchor for mobility and travel.',   29.00, 140, 4.4, '/images/products/fitness/fitness-23.jpg'),
    (6, 'Battle Rope 15m',                    'TRN-004', '38mm poly-dac battle rope with heat-shrink end caps.',                   79.00,  24, 4.6, '/images/products/fitness/fitness-24.jpg'),
    (6, '12-Pack Agility Cones',              'TRN-005', 'Stackable 23cm agility cones with mesh carry bag.',                      14.99, 220, 4.4, '/images/products/fitness/fitness-25.jpg'),
    (6, 'Hurdle Set 15cm/22cm',               'TRN-006', 'Pair of adjustable plastic hurdles for plyometric drills.',              39.99,  80, 4.5, '/images/products/fitness/fitness-26.jpg'),
    (6, 'Reaction Ball Pro',                  'TRN-007', 'Six-sided reaction ball for unpredictable bounces.',                     16.99, 150, 4.3, '/images/products/fitness/fitness-27.jpg'),
    (6, 'TRX-Style Suspension Trainer',       'TRN-008', 'Heavy-duty suspension trainer with door anchor and carry bag.',          89.00,  38, 4.6, '/images/products/fitness/fitness-28.jpg'),
    (6, 'Medicine Ball 6kg',                  'TRN-009', 'Soft-grip medicine ball with textured outer for confident handling.',    39.99,  60, 4.5, '/images/products/fitness/fitness-29.jpg'),
    (6, 'Speed Parachute Trainer',            'TRN-010', 'Adjustable resistance parachute for sprint training.',                   29.99,  70, 4.3, '/images/products/fitness/fitness-30.jpg'),
    (6, 'Sled Pull Strap and Harness',        'TRN-011', 'Padded harness and strap rig for sled pulls and pushes.',                49.99,  45, 4.4, '/images/products/fitness/fitness-31.jpg'),
    (6, 'Sand-Filled Power Bag 20kg',         'TRN-012', 'Multi-handle power bag for carries, slams and conditioning.',            89.99,  22, 4.6, '/images/products/fitness/fitness-32.jpg'),
    (6, 'Slam Ball Set 4-6-8 kg',             'TRN-013', 'Three-piece slam ball set with no-bounce textured shell.',              119.00,  18, 4.5, '/images/products/fitness/fitness-33.jpg'),
    (6, 'Vertical Jump Mat',                  'TRN-014', 'Switch-mat vertical jump tester with digital display.',                 199.00,   9, 4.6, '/images/products/fitness/fitness-34.jpg'),
    (6, 'Stopwatch and Whistle Combo',        'TRN-015', 'Coach kit with stopwatch, whistle and lanyard.',                         14.99, 200, 4.4, '/images/products/fitness/fitness-35.jpg'),
    (6, 'Fan Bike Air Trainer',               'TRN-016', 'Air-resistance bike with adjustable seat and console.',                 499.00,   7, 4.5, '/images/products/fitness/fitness-36.jpg'),
    (6, 'Ankle Resistance Bands',             'TRN-017', 'Pair of ankle loops for hip and glute activation work.',                 19.99, 160, 4.4, '/images/products/fitness/fitness-37.jpg'),
    (6, 'Reflex Reaction Strobe Glasses',     'TRN-018', 'Strobe glasses train visual reaction speed in 8 modes.',                149.00,  12, 4.5, '/images/products/fitness/fitness-38.jpg'),
    (6, 'Suspension Anchor Strap',            'TRN-019', 'Door anchor and tree strap for outdoor suspension training.',            17.99, 130, 4.3, '/images/products/fitness/fitness-39.jpg'),
    (6, 'Training Bib Set (10 pcs)',          'TRN-020', 'Reversible mesh bibs in five sizes with mesh bag.',                      29.99,  90, 4.4, '/images/products/fitness/fitness-40.jpg'),

    -- Accessories (20)
    (7, 'HydroFlow 1L Water Bottle',          'ACC-001', 'Vacuum-insulated stainless bottle, leakproof flip cap.',                 29.99, 200, 4.6, '/images/products/accessories/accessories-1.jpg'),
    (7, 'Trainer Gym Backpack 30L',           'ACC-002', 'Wet/dry compartment, padded laptop sleeve and ventilated shoe pocket.',  69.00,  50, 4.5, '/images/products/accessories/accessories-2.jpg'),
    (7, 'Performance Sport Watch',            'ACC-003', 'GPS multi-sport watch with heart-rate and 14-day battery life.',        249.00,  18, 4.7, '/images/products/accessories/accessories-3.jpg'),
    (7, 'Quick-Dry Sport Towel',              'ACC-004', 'Microfibre towel that dries 3x faster than cotton.',                     14.99, 220, 4.3, '/images/products/accessories/accessories-4.jpg'),
    (7, 'Wireless Sport Earbuds',             'ACC-005', 'IPX7 sweat-proof earbuds with 30h total battery life.',                  89.00,  60, 4.5, '/images/products/accessories/accessories-5.jpg'),
    (7, 'Compact Foam Roller',                'ACC-006', 'Travel-size 30cm foam roller for warm-ups and recovery.',                19.99, 130, 4.4, '/images/products/accessories/accessories-6.jpg'),
    (7, 'Sweat-Wicking Headband',             'ACC-007', 'Pack of three moisture-wicking headbands.',                               12.99, 200, 4.3, '/images/products/accessories/accessories-7.jpg'),
    (7, 'Insulated 750ml Bottle',             'ACC-008', 'Slim 750ml stainless bottle keeps cold for 24 hours.',                    24.99, 180, 4.5, '/images/products/accessories/accessories-8.jpg'),
    (7, 'Athletic Wristband Set',             'ACC-009', 'Pair of cotton terry wristbands, soft and absorbent.',                    9.99, 240, 4.2, '/images/products/accessories/accessories-9.jpg'),
    (7, 'Sports Sunglasses UV400',            'ACC-010', 'Polarised sport sunglasses with anti-slip nose pads.',                    49.99,  70, 4.5, '/images/products/accessories/accessories-10.jpg'),
    (7, 'Foldable Tote Gym Bag',              'ACC-011', 'Packable 25L gym tote with shoe compartment.',                            34.99, 100, 4.4, '/images/products/accessories/accessories-11.jpg'),
    (7, 'Bluetooth Sport Speaker',            'ACC-012', 'Compact IPX5 Bluetooth speaker with carabiner clip.',                     39.99,  85, 4.4, '/images/products/accessories/accessories-12.jpg'),
    (7, 'Compression Shin Sleeves',           'ACC-013', 'Targeted compression for warmup and recovery.',                           19.99, 150, 4.4, '/images/products/accessories/accessories-13.jpg'),
    (7, 'Knee Stabilizer Brace',              'ACC-014', 'Hinged knee brace with breathable neoprene wrap.',                        39.99,  65, 4.5, '/images/products/accessories/accessories-14.jpg'),
    (7, 'Antibacterial Mouth Guard',          'ACC-015', 'Boil-and-bite mouth guard with antimicrobial layer.',                     14.99, 180, 4.3, '/images/products/accessories/accessories-15.jpg'),
    (7, 'Compression Arm Sleeve',             'ACC-016', 'Sweat-wicking compression sleeve with UV protection.',                    17.99, 200, 4.3, '/images/products/accessories/accessories-16.jpg'),
    (7, 'Heart Rate Monitor Strap',           'ACC-017', 'Bluetooth and ANT+ chest strap heart-rate monitor.',                      79.00,  35, 4.6, '/images/products/accessories/accessories-17.jpg'),
    (7, 'Sport Cap Adjustable',               'ACC-018', 'Lightweight running/tennis cap with sweatband.',                          19.99, 220, 4.4, '/images/products/accessories/accessories-18.jpg'),
    (7, 'Travel Toiletry Sport Kit',          'ACC-019', 'Hanging toiletry kit with mesh pockets and water-resistant base.',        24.99, 110, 4.4, '/images/products/accessories/accessories-19.jpg'),
    (7, 'Lifting Hooks Pair',                 'ACC-020', 'Padded steel lifting hooks with non-slip neoprene wrap.',                 22.99,  95, 4.5, '/images/products/accessories/accessories-20.jpg');
