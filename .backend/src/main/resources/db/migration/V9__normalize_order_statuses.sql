UPDATE orders SET status = 'PENDING' WHERE status = 'PLACED';
UPDATE orders SET status = 'CONFIRMED' WHERE status = 'PAID';
