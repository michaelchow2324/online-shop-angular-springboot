-- Add CA Tissue Covers and CA Coin Pouches, set catalog display order,
-- and move Canada products out of the HK categories.

ALTER TABLE category
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 100;

INSERT INTO category (name, slug, description, image_media_id, active, sort_order)
VALUES
  ('CA Tissue Covers', 'ca-tissue-box-covers', 'Decorative tissue box covers (Canada style)', NULL, TRUE, 3),
  ('CA Coin Pouches', 'ca-coin-pouches', 'Small coin pouches and holders (Canada style)', NULL, TRUE, 4)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    active = TRUE,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

UPDATE category SET sort_order = 1, updated_at = now() WHERE slug = 'hk-tissue-box-covers';
UPDATE category SET sort_order = 2, updated_at = now() WHERE slug = 'hk-coin-pouches';
UPDATE category SET sort_order = 3, updated_at = now() WHERE slug = 'ca-tissue-box-covers';
UPDATE category SET sort_order = 4, updated_at = now() WHERE slug = 'ca-coin-pouches';
UPDATE category SET sort_order = 5, updated_at = now() WHERE slug = 'makeup-bags';
UPDATE category SET sort_order = 6, updated_at = now() WHERE slug = 'wallets';
UPDATE category SET sort_order = 7, updated_at = now() WHERE slug = 'cosmetic-bags';
UPDATE category SET sort_order = 8, updated_at = now() WHERE slug = 'accessories';
UPDATE category SET sort_order = 9, updated_at = now() WHERE slug = 'headbands';

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/tissue-box-cover-canada.JPG', 'CA Tissue Covers', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'ca-tissue-box-covers'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.is_primary = TRUE
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/mini-pouch-canada.JPG', 'CA Coin Pouches', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'ca-coin-pouches'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.is_primary = TRUE
  );

UPDATE category
SET image_media_id = m.id,
    updated_at = now()
FROM media m
WHERE m.entity_type = 'category'
  AND m.entity_id = category.id
  AND m.is_primary = TRUE
  AND category.slug IN ('ca-tissue-box-covers', 'ca-coin-pouches')
  AND (category.image_media_id IS NULL OR category.image_media_id <> m.id);

INSERT INTO category_translation (category_id, locale, name, description)
SELECT c.id, loc.locale, loc.name, loc.description
FROM category c
CROSS JOIN (
  VALUES
    ('zh-HK', '加拿大主題紙巾套', '裝飾性紙巾盒套（加拿大風格）。'),
    ('zh-TW', '加拿大主題紙巾套', '裝飾性紙巾盒套（加拿大風格）。')
) AS loc(locale, name, description)
WHERE c.slug = 'ca-tissue-box-covers'
ON CONFLICT (category_id, locale) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = now();

INSERT INTO category_translation (category_id, locale, name, description)
SELECT c.id, loc.locale, loc.name, loc.description
FROM category c
CROSS JOIN (
  VALUES
    ('zh-HK', '加拿大主題散紙包', '小巧的硬幣包與收納包（加拿大風格）。'),
    ('zh-TW', '加拿大主題散紙包', '小巧的硬幣包與收納包（加拿大風格）。')
) AS loc(locale, name, description)
WHERE c.slug = 'ca-coin-pouches'
ON CONFLICT (category_id, locale) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = now();

DELETE FROM category_product
WHERE product_id = (SELECT id FROM product WHERE slug = 'tissue-box-cover-canada')
  AND category_id = (SELECT id FROM category WHERE slug = 'hk-tissue-box-covers');

DELETE FROM category_product
WHERE product_id = (SELECT id FROM product WHERE slug = 'mini-pouch-canada')
  AND category_id = (SELECT id FROM category WHERE slug = 'hk-coin-pouches');

INSERT INTO category_product (category_id, product_id)
SELECT c.id, p.id
FROM category c
JOIN product p ON p.slug = 'tissue-box-cover-canada'
WHERE c.slug = 'ca-tissue-box-covers'
ON CONFLICT (category_id, product_id) DO NOTHING;

INSERT INTO category_product (category_id, product_id)
SELECT c.id, p.id
FROM category c
JOIN product p ON p.slug = 'mini-pouch-canada'
WHERE c.slug = 'ca-coin-pouches'
ON CONFLICT (category_id, product_id) DO NOTHING;
