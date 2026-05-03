-- Persist the primary product image at checkout so order history stays accurate
-- even if catalog images change later. Backfill existing rows from products.

ALTER TABLE order_items ADD COLUMN product_image_url_snapshot VARCHAR(500) NULL;

UPDATE order_items oi
SET product_image_url_snapshot = (
    SELECT p.image_url FROM products p WHERE p.id = oi.product_id
)
WHERE oi.product_id IS NOT NULL;
