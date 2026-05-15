ALTER TABLE system_settings
    ADD COLUMN shipping_enabled BIT NOT NULL DEFAULT 1;

ALTER TABLE system_settings
    ADD COLUMN express_shipping_surcharge DECIMAL(12, 2) NOT NULL DEFAULT 12.99;
