-- The catalog is served from an in-memory repository, so product IDs are not
-- guaranteed to exist in the `products` table. Order items already snapshot
-- `product_name_snapshot` and `unit_price_snapshot`, so a hard FK to products
-- prevents checkout without giving us anything in return. Drop it.
ALTER TABLE order_items DROP FOREIGN KEY fk_order_item_product;
