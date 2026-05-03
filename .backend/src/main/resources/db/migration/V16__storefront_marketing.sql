CREATE TABLE marketing_banners (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    slot VARCHAR(32) NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(500),
    cta_label VARCHAR(80),
    cta_href VARCHAR(500),
    badge VARCHAR(80),
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP(6) NULL,
    ends_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL
);

CREATE INDEX idx_marketing_banners_slot_active ON marketing_banners (slot, active, sort_order);

CREATE TABLE newsletter_subscribers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) NOT NULL UNIQUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE editorial_features (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    excerpt VARCHAR(600),
    image_url VARCHAR(500),
    href VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NULL
);

CREATE INDEX idx_editorial_features_active_sort ON editorial_features (active, sort_order);

INSERT INTO marketing_banners (slot, title, subtitle, cta_label, cta_href, badge, sort_order, active)
VALUES ('TOP_BAR', 'Free shipping over $75', 'Easy 30-day returns on qualifying gear.', 'Shop deals', '/products?maxPrice=80', 'Today', 0, TRUE),
       ('HERO_SECONDARY', 'Winter training sale', 'Layer up with outlet prices on jackets and fleece.', 'Shop sale', '/products?maxPrice=70', 'Sale', 0, TRUE);

INSERT INTO editorial_features (title, excerpt, image_url, href, sort_order, active)
VALUES ('Build your home gym', 'Compact strength picks that fit real spaces.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', '/products?category=fitness', 0, TRUE),
       ('Recovery matters', 'Foam rollers, mobility tools, and rest-day staples.', 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80', '/products?category=training', 1, TRUE);
