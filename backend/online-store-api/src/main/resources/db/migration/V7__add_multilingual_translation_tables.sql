-- V7__add_multilingual_translation_tables.sql
-- Adds dedicated translation tables for product and category content.

CREATE TABLE IF NOT EXISTS category_translation (
  id BIGSERIAL PRIMARY KEY,
  category_id BIGINT NOT NULL,
  locale VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT fk_category_translation_category
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_category_translation_locale
  ON category_translation (category_id, locale);

CREATE TABLE IF NOT EXISTS product_translation (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL,
  locale VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  CONSTRAINT fk_product_translation_product
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_product_translation_locale
  ON product_translation (product_id, locale);
