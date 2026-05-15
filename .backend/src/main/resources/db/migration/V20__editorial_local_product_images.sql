-- Replace external editorial hero images with same-origin assets (served by the SPA from /public).
UPDATE editorial_features
SET image_url = '/images/products/Category/Fitness/Addides/bench-personal-gallery-3.jpg'
WHERE title = 'Build your home gym';

UPDATE editorial_features
SET image_url = '/images/products/Category/Fitness/Nike/seamless1_color1_related1.png'
WHERE title = 'Recovery matters';
