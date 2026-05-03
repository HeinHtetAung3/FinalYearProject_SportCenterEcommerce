-- The catalog is served from an in-memory repository, so product IDs are not
-- guaranteed to exist in the `products` table. The persistent per-user cart
-- (introduced for user-isolated bags) needs to store any product id the user
-- adds, so the FK to products(id) blocks legitimate inserts. V10 already
-- dropped the equivalent FK on order_items for the same reason; do the same
-- for cart_items.
ALTER TABLE cart_items DROP FOREIGN KEY fk_cart_items_v7_product;
