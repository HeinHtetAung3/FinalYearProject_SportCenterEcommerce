INSERT INTO roles(name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

INSERT INTO categories(name, slug) VALUES
('Footwear', 'footwear'),
('Balls', 'balls'),
('Fitness', 'fitness');

INSERT INTO products(category_id, name, sku, description, price, stock_quantity, average_rating) VALUES
(1, 'Sprint Pro Running Shoes', 'SHOE-001', 'Lightweight running shoes', 89.99, 80, 4.5),
(2, 'Match Day Football', 'BALL-001', 'Official size football', 29.99, 120, 4.2),
(3, 'Core Strength Kettlebell 16kg', 'FIT-001', 'Durable iron kettlebell', 54.99, 60, 4.7);
