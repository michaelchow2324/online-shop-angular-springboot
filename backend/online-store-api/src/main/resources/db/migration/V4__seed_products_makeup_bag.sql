-- V4__seed_products_makeup_bag.sql
-- Seed makeup bag products and their media entries.

-- Insert products (id is generated). Use ON CONFLICT to avoid duplicates by slug.
-- it will skip inserting a product if another product with the same slug already exists, ensuring that running this migration multiple times won't create duplicate entries.
-- slug is UNIQUE in the product table
INSERT INTO product (name, slug, description, price, active)
VALUES
  ('Makeup Bag Blue Bear', 'makeup-bag-blue-bear', 'Adorable blue bear print makeup bag, a compact cosmetic pouch ideal for travel and daily organization. Lightweight and durable with a secure zip closure.', 35.00, TRUE),
  ('Makeup Bag Fluffy Cat', 'makeup-bag-fluffy-cat', 'Soft fluffy cat makeup bag that keeps cosmetics tidy on the go. Perfect gift for cat lovers; fits brushes, palettes and essentials.', 35.00, TRUE),
  ('Makeup Bag Golden Teddy', 'makeup-bag-golden-teddy', 'Charming golden teddy cosmetic pouch with stylish print, designed for everyday makeup storage and travel organization.', 35.00, TRUE),
  ('Makeup Bag Pastel Stripes', 'makeup-bag-pastel-stripes', 'Pastel stripes makeup bag offering a cheerful, lightweight cosmetic organizer for travel and home use. Easy-to-clean fabric and secure zipper.', 35.00, TRUE),
  ('Makeup Bag Pink Blossoms', 'makeup-bag-pink-blossoms', 'Floral pink blossoms makeup bag — a feminine cosmetic pouch for storing beauty essentials while travelling or at home.', 35.00, TRUE),
  ('Makeup Bag Pink Bows', 'makeup-bag-pink-bows', 'Cute pink bows makeup bag that combines style and function for daily cosmetic organization and safe travel storage.', 35.00, TRUE),
  ('Makeup Bag Quilt Bloom', 'makeup-bag-quilt-bloom', 'Quilted bloom makeup bag with padded protection for cosmetics and brushes, perfect for organized storage and travel.', 35.00, TRUE),
  ('Makeup Bag Ribbon Charm', 'makeup-bag-ribbon-charm', 'Ribbon charm cosmetic pouch with delicate detailing, designed to keep makeup and small accessories neatly organised.', 35.00, TRUE),
  ('Makeup Bag Soft Cloud', 'makeup-bag-soft-cloud', 'Soft cloud makeup bag with a plush look, ideal for storing daily cosmetics and small toiletries when travelling.', 35.00, TRUE),
  ('Makeup Bag Teddy Dot', 'makeup-bag-teddy-dot', 'Teddy dot cosmetic pouch featuring playful dots and a compact design, great for handbag storage and travel essentials.', 35.00, TRUE),
  ('Makeup Bag Vintage Garden', 'makeup-bag-vintage-garden', 'Vintage garden floral makeup bag with timeless style, a practical cosmetic organizer for travel and everyday use.', 35.00, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Insert media rows for seeded categories. Uses safe checks to avoid duplicates.
-- Ensure the storage_key matches where you uploaded files in MinIO (recommended prefix: categories/)

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-blue-bear.jpeg', 'Makeup Bag Blue Bear', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-blue-bear'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-blue-bear.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-fluffy-cat.jpeg', 'Makeup Bag Fluffy Cat', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-fluffy-cat'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-fluffy-cat.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-golden-teddy.jpeg', 'Makeup Bag Golden Teddy', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-golden-teddy'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-golden-teddy.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-pastel-stripes.jpeg', 'Makeup Bag Pastel Stripes', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-pastel-stripes'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-pastel-stripes.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-pink-blossoms.jpeg', 'Makeup Bag Pink Blossoms', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-pink-blossoms'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-pink-blossoms.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-pink-bows.jpeg', 'Makeup Bag Pink Bows', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-pink-bows'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-pink-bows.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-quilt-bloom.jpeg', 'Makeup Bag Quilt Bloom', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-quilt-bloom'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-quilt-bloom.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-ribbon-charm.jpeg', 'Makeup Bag Ribbon Charm', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-ribbon-charm'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-ribbon-charm.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-soft-cloud.jpeg', 'Makeup Bag Soft Cloud', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-soft-cloud'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-soft-cloud.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-teddy-dot.jpeg', 'Makeup Bag Teddy Dot', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-teddy-dot'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-teddy-dot.jpeg'
  );

INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'products/makeup-bag-vintage-garden.jpeg', 'Makeup Bag Vintage Garden', TRUE, now(), 'product', p.id
FROM product p
WHERE p.slug = 'makeup-bag-vintage-garden'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'product' AND m.entity_id = p.id AND m.storage_key = 'products/makeup-bag-vintage-garden.jpeg'
  );

-- Explanation: for each product row, find media rows m with m.entity_type='product' and m.entity_id = product.id. If such m exists, set that product's image_media_id to m.id.
-- Link products to their primary media row (if present)
UPDATE product
SET image_media_id = m.id
FROM media m
WHERE m.entity_type = 'product'
  AND m.entity_id = product.id
  AND m.is_primary = TRUE
  AND (product.image_media_id IS NULL OR product.image_media_id <> m.id);
