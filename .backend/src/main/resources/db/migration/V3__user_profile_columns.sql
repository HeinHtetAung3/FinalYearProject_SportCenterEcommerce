ALTER TABLE users ADD COLUMN phone_number VARCHAR(40) NULL;
ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL;

CREATE INDEX idx_users_enabled ON users(enabled);
