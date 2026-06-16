-- V8__seed_translation_tables.sql
-- Seed Traditional Chinese translations for the current product/category catalog.

INSERT INTO category_translation (category_id, locale, name, description)
VALUES
  ((SELECT id FROM category WHERE slug='wallets'), 'zh-HK', '皮夾', '皮革與布料製成的皮夾。'),
  ((SELECT id FROM category WHERE slug='cosmetic-bags'), 'zh-HK', '化妝包', '適合化妝品與旅行用品的包款。'),
  ((SELECT id FROM category WHERE slug='accessories'), 'zh-HK', '配件', '小型配件與皮帶與飾品。'),
  ((SELECT id FROM category WHERE slug='headbands'), 'zh-HK', '髮帶', '髮帶與頭飾配件。'),
  ((SELECT id FROM category WHERE slug='hk-tissue-box-covers'), 'zh-HK', '港式紙巾套', '裝飾性紙巾盒套（香港風格）。'),
  ((SELECT id FROM category WHERE slug='hk-coin-pouches'), 'zh-HK', '港式硬幣包', '小巧的硬幣包與收納包。'),
  ((SELECT id FROM category WHERE slug='makeup-bags'), 'zh-HK', '化妝包', '時尚又實用的化妝包。')
ON CONFLICT (category_id, locale) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = now();

INSERT INTO product_translation (product_id, locale, name, description)
VALUES
  ((SELECT id FROM product WHERE slug='makeup-bag-blue-bear'), 'zh-HK', '藍色小熊化妝包', '可愛藍色小熊圖案化妝包，適合旅行與日常整理。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-fluffy-cat'), 'zh-HK', '毛絨貓咪化妝包', '柔軟毛絨貓咪設計，方便收納彩妝與旅行用品。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-golden-teddy'), 'zh-HK', '金色泰迪化妝包', '可愛金色泰迪圖案，適合日常彩妝收納與旅行。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-pastel-stripes'), 'zh-HK', '柔彩條紋化妝包', '柔和條紋設計，輕巧耐用，適合出門與居家收納。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-pink-blossoms'), 'zh-HK', '粉色花朵化妝包', '粉嫩花朵圖案，適合收納美妝品與小物。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-pink-bows'), 'zh-HK', '粉色蝴蝶結化妝包', '可愛粉色蝴蝶結設計，兼顧風格與實用性。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-quilt-bloom'), 'zh-HK', '棉被花朵化妝包', '加厚絎縫設計，保護化妝品與刷具。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-ribbon-charm'), 'zh-HK', '緞帶飾紋化妝包', '細緻緞帶設計，方便整理彩妝與小配件。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-soft-cloud'), 'zh-HK', '柔軟雲朵化妝包', '柔軟雲朵風格，適合日常彩妝與旅行小物。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-teddy-dot'), 'zh-HK', '泰迪點點化妝包', '可愛點點圖案與輕巧款式，方便隨身攜帶。'),
  ((SELECT id FROM product WHERE slug='makeup-bag-vintage-garden'), 'zh-HK', '復古花園化妝包', '復古花園風格，兼具時尚感與實用收納功能。')
ON CONFLICT (product_id, locale) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = now();
