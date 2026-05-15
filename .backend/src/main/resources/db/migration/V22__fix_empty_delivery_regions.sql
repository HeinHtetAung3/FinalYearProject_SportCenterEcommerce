-- Empty JSON array or blank regions made every checkout fail region validation.
UPDATE system_settings
SET delivery_regions_json = '["United States"]'
WHERE id = 1
  AND (
        delivery_regions_json IS NULL
        OR TRIM(delivery_regions_json) = ''
        OR TRIM(delivery_regions_json) = '[]'
        OR LOWER(TRIM(delivery_regions_json)) = 'null'
    );
