-- V2__seed_categories.sql
-- Seed some initial categories for local development.
-- Insert categories. image_media_id is available from V1; set explicitly to NULL here so schema and seed align.
INSERT INTO category (name, slug, description, image_media_id, active)
VALUES
  ('Wallets', 'wallets', 'Leather and fabric wallets', NULL, TRUE),
  ('Cosmetic Bags', 'cosmetic-bags', 'Makeup and toiletry bags', NULL, TRUE),
  ('Accessories', 'accessories', 'Small accessories and straps', NULL, TRUE),
  ('Headbands', 'headbands', 'Headbands and hair accessories', NULL, TRUE),
  ('HK Tissue Covers', 'hk-tissue-box-covers', 'Decorative tissue box covers (HK style)', NULL, TRUE),
  ('HK Coin Pouches', 'hk-coin-pouches', 'Small coin pouches and holders (HK style)', NULL, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Insert media rows for seeded categories. Uses safe checks to avoid duplicates.
-- Ensure the storage_key matches where you uploaded files in MinIO (recommended prefix: categories/)

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/wallet-001.jpeg', 'Wallets', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'wallets'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/wallet-001.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/cosmetic-bag-001.jpeg', 'Cosmetic Bags', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'cosmetic-bags'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/cosmetic-bag-001.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/cable-strap-001.jpeg', 'Accessories', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'accessories'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/cable-strap-001.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/headband-001.jpeg', 'Headbands', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'headbands'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/headband-001.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/hk-tissue-box-cover-001.jpeg', 'HK Tissue Covers', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'hk-tissue-box-covers'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/hk-tissue-box-cover-001.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/hk-coin-pouch-001.jpeg', 'HK Coin Pouches', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'hk-coin-pouches'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/hk-coin-pouch-001.jpeg'
  );

-- Link categories to their primary media row (if present)
UPDATE category
SET image_media_id = m.id
FROM media m
WHERE m.entity_type = 'category'
  AND m.entity_id = category.id
  AND m.is_primary = TRUE
  AND (category.image_media_id IS NULL OR category.image_media_id <> m.id);
