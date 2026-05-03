ALTER TABLE users
    ADD COLUMN marketing_email_opt_in BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE user_addresses (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    label VARCHAR(60) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    email VARCHAR(120) NULL,
    line1 VARCHAR(200) NOT NULL,
    line2 VARCHAR(120) NULL,
    city VARCHAR(80) NOT NULL,
    region VARCHAR(80) NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(80) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses (user_id);
