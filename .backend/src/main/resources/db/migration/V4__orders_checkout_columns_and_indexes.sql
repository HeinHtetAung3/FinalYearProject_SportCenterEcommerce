ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(255) NULL;
ALTER TABLE orders ADD COLUMN payment_method VARCHAR(80) NULL;

CREATE INDEX idx_orders_user_created ON orders(user_id, created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
