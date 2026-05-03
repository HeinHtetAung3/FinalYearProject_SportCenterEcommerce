-- Additional demo products so the catalog feels real once the backend runs.
-- Three extra products per existing category (Footwear=1, Balls=2, Fitness=3).

INSERT INTO products(category_id, name, sku, description, price, stock_quantity, average_rating) VALUES
(1, 'TrailBlaze All-Terrain Trainers', 'SHOE-002', 'Aggressive lugs and waterproof upper for unpredictable trails.', 159.00, 35, 4.6),
(1, 'Velocity X Studded Football Boots', 'SHOE-003', 'Soft synthetic upper with precision-stud configuration for explosive acceleration.', 189.50, 22, 4.7),
(1, 'Court King Basketball Shoes', 'SHOE-004', 'High-cut ankle support, herringbone traction and full-length cushioning.', 145.00, 18, 4.5),

(2, 'Grand Slam Tennis Balls (Pack of 4)', 'BALL-002', 'Tournament-grade pressurised tennis balls with high-felt durability.', 14.50, 200, 4.3),
(2, 'Slam Dunk Indoor Basketball', 'BALL-003', 'Composite leather basketball engineered for indoor courts.', 49.99, 75, 4.6),
(2, 'Rally Volleyball Pro', 'BALL-004', 'Soft-touch synthetic leather volleyball with reinforced bladder.', 34.00, 50, 4.2),

(3, 'PowerForge Adjustable Dumbbells', 'FIT-002', 'Quick-select dumbbells from 5 to 50 lbs each. Replaces 15 pairs.', 349.00, 14, 4.8),
(3, 'FlexGrip Premium Yoga Mat', 'FIT-003', 'Non-slip 6mm yoga mat with closed-cell, sweat-resistant surface.', 49.50, 120, 4.5),
(3, 'IronCore Olympic Barbell 20kg', 'FIT-004', 'Knurled, dual-marked Olympic barbell rated for 1500 lb.', 279.00, 8, 4.9);
