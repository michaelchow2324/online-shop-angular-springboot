-- V5__add_makeup_bags_category.sql
-- Add the "Makeup Bags" category if it doesn't exist

INSERT INTO category (name, slug, description, image_media_id, active)
VALUES
  ('Makeup Bags', 'makeup-bags', 'Stylish and functional makeup bags for organizing cosmetics', NULL, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Insert media for the Makeup Bags category
INSERT INTO media (storage_key, alt, is_primary, created_at, entity_type, entity_id)
SELECT 'categories/makeup-bags-001.jpeg', 'Makeup Bags', TRUE, now(), 'category', c.id
FROM category c
WHERE c.slug = 'makeup-bags'
  AND NOT EXISTS (
    SELECT 1 FROM media m
    WHERE m.entity_type = 'category' AND m.entity_id = c.id AND m.storage_key = 'categories/makeup-bags-001.jpeg'
  );

-- Link category to its primary media row
UPDATE category
SET image_media_id = m.id
FROM media m
WHERE m.entity_type = 'category'
  AND m.entity_id = category.id
  AND m.is_primary = TRUE
  AND category.slug = 'makeup-bags'
  AND (category.image_media_id IS NULL OR category.image_media_id <> m.id);
