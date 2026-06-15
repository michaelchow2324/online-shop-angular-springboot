-- V1__create_category_and_image_tables.sql
-- Creates category and product_image tables for the Category feature.
-- Creates category and media tables for the Category feature.

CREATE TABLE IF NOT EXISTS category (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE, -- A URL friendly alias
  description TEXT,
  image_media_id BIGINT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id BIGSERIAL PRIMARY KEY,
  storage_key VARCHAR(1024) NOT NULL,
  alt VARCHAR(512), -- Alternative text for accessibility
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  metadata JSONB
);

-- Composite B-tree index on (entity_type, entity_id).
-- Instead of scanning every row in the media table sequentially (O(n)),
-- PostgreSQL navigates the B-tree in O(log n) steps to find matching entries,
-- then follows their heap pointers directly to the relevant rows.
-- Example: querying media for entity_type='category' AND entity_id=5 goes straight
-- to that subtree, skipping all unrelated rows entirely.
CREATE INDEX IF NOT EXISTS idx_media_entity ON media(entity_type, entity_id);

-- Partial unique index: only indexes rows where is_primary = TRUE.
-- Enforces the business rule that each (entity_type, entity_id) pair can have
-- at most one primary image. Non-primary images are not indexed here, so many
-- non-primary images per entity are still allowed.
CREATE UNIQUE INDEX IF NOT EXISTS ux_media_entity_primary ON media(entity_type, entity_id) WHERE is_primary;

-- Add foreign key from category.image_media_id -> media.id if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_category_image_media'
  ) THEN
    ALTER TABLE category ADD CONSTRAINT fk_category_image_media FOREIGN KEY (image_media_id) REFERENCES media(id);
  END IF;
END$$;
