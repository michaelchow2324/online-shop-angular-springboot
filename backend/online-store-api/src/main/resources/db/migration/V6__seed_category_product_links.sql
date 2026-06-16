-- V6__seed_category_product_links.sql
-- Link all makeup bag products to the "Makeup Bags" category

INSERT INTO category_product (category_id, product_id)
SELECT c.id, p.id
FROM category c
CROSS JOIN product p
WHERE c.slug = 'makeup-bags'
  AND p.slug IN (
    'makeup-bag-blue-bear',
    'makeup-bag-fluffy-cat',
    'makeup-bag-golden-teddy',
    'makeup-bag-pastel-stripes',
    'makeup-bag-pink-blossoms',
    'makeup-bag-pink-bows',
    'makeup-bag-quilt-bloom',
    'makeup-bag-ribbon-charm',
    'makeup-bag-soft-cloud',
    'makeup-bag-teddy-dot',
    'makeup-bag-vintage-garden'
  )
  AND NOT EXISTS (
    SELECT 1 FROM category_product cp
    WHERE cp.category_id = c.id AND cp.product_id = p.id
  );
