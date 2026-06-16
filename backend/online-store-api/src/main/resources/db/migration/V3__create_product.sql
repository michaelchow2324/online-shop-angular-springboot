-- V3__create_product.sql
-- Creates the product table and the category_product junction table.

CREATE TABLE IF NOT EXISTS product (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE, -- A URL friendly alias
  description TEXT,
  price NUMERIC(12, 2) NOT NULL, -- Precision : 12 total digits, decimal places : 2
  image_media_id BIGINT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Add foreign key from product.image_media_id -> media.id if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_product_image_media'
  ) THEN
    ALTER TABLE product ADD CONSTRAINT fk_product_image_media FOREIGN KEY (image_media_id) REFERENCES media(id);
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS category_product (
  category_id BIGINT NOT NULL,
  product_id  BIGINT NOT NULL,
  PRIMARY KEY (category_id, product_id)
);

-- Referential integrity for the junction table: ensure relationship between tables stay valid. e.g. category.id must exist for each category_product.category_id record
-- category_product.category_id must match an existing category.id,
-- and category_product.product_id must match an existing product.id.
-- Add foreign keys for category_product junction table, guarded individually
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cp_category'
  ) THEN
    ALTER TABLE category_product ADD CONSTRAINT fk_cp_category FOREIGN KEY (category_id) REFERENCES category(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_cp_product'
  ) THEN
    ALTER TABLE category_product ADD CONSTRAINT fk_cp_product FOREIGN KEY (product_id) REFERENCES product(id);
  END IF;
END$$;

-- Add index to support lookups by product_id -> category_id.
-- The table declares a PRIMARY KEY (category_id, product_id) which implicitly
-- creates a UNIQUE b-tree index on (category_id, product_id). That index
-- already makes queries filtered by `category_id` fast. For efficient
-- queries filtered by `product_id` (the opposite direction), we create the
-- swapped composite index below.
CREATE INDEX IF NOT EXISTS idx_category_product_product
  ON category_product (product_id, category_id);

COMMENT ON INDEX idx_category_product_product IS
  'Supports lookups from product_id -> category_id; PK covers category_id->product_id';

--   PRIMARY KEY (category_id, product_id) creates an index on the pair (category_id, product_id).
-- That index is ordered first by category_id, then by product_id.
-- So lookups that filter by category_id are fast, because the index is built around that first column, so lookup for product_id is slow (read line by line instead of b-tree).