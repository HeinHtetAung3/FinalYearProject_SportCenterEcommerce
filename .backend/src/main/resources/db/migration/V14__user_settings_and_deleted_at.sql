ALTER TABLE users
    ADD COLUMN deleted_at TIMESTAMP(6) NULL;

CREATE TABLE user_settings (
    user_id BIGINT NOT NULL PRIMARY KEY,
    language VARCHAR(16) NOT NULL DEFAULT 'en',
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(64) NOT NULL DEFAULT 'America/New_York',
    dark_mode BOOLEAN NOT NULL DEFAULT FALSE,
    order_updates BOOLEAN NOT NULL DEFAULT TRUE,
    promotions BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    profile_visibility VARCHAR(32) NOT NULL DEFAULT 'PRIVATE',
    data_sharing BOOLEAN NOT NULL DEFAULT FALSE,
    personalized_ads BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

INSERT INTO user_settings (
    user_id,
    language,
    currency,
    timezone,
    dark_mode,
    order_updates,
    promotions,
    email_notifications,
    sms_notifications,
    profile_visibility,
    data_sharing,
    personalized_ads
)
SELECT
    id,
    'en',
    'USD',
    'America/New_York',
    FALSE,
    TRUE,
    marketing_email_opt_in,
    TRUE,
    FALSE,
    'PRIVATE',
    FALSE,
    FALSE
FROM users;
