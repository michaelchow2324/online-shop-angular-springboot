CREATE TABLE IF NOT EXISTS shop_order (
  id                          BIGSERIAL PRIMARY KEY,
  order_number                VARCHAR(32)  NOT NULL UNIQUE,
  user_id                     BIGINT       NULL,
  email                       VARCHAR(255) NOT NULL,
  status                      VARCHAR(32)  NOT NULL,
  currency                    CHAR(3)      NOT NULL DEFAULT 'CAD',
  subtotal                    NUMERIC(12,2) NOT NULL,
  shipping_fee                NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax                         NUMERIC(12,2) NOT NULL DEFAULT 0,
  total                       NUMERIC(12,2) NOT NULL,
  shipping_name               VARCHAR(255) NOT NULL,
  shipping_phone              VARCHAR(64),
  shipping_line1              VARCHAR(255) NOT NULL,
  shipping_line2              VARCHAR(255),
  shipping_city               VARCHAR(128) NOT NULL,
  shipping_province           VARCHAR(8)   NOT NULL,
  shipping_postal             VARCHAR(16)  NOT NULL,
  shipping_country            CHAR(2)      NOT NULL DEFAULT 'CA',
  shipping_zone               VARCHAR(16),
  shipping_method             VARCHAR(32)  NOT NULL DEFAULT 'regular',
  carrier                     VARCHAR(64),
  tracking_number             VARCHAR(128),
  stripe_checkout_session_id  VARCHAR(255) UNIQUE,
  stripe_payment_intent_id    VARCHAR(255),
  paid_at                     TIMESTAMP WITHOUT TIME ZONE,
  shipped_at                  TIMESTAMP WITHOUT TIME ZONE,
  created_at                  TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at                  TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Orders need a snapshot of what was bought at checkout time
-- so we capture the product name, price, and quantity at that time.
-- line_total = unit_price × quantity for that row (e.g. $25 × 2 = $50). Storing it avoids recalculating and keeps a clear record of what the customer was charged for that line, even if pricing rules change later.
CREATE TABLE IF NOT EXISTS shop_order_item (
  id            BIGSERIAL PRIMARY KEY,
  order_id      BIGINT        NOT NULL REFERENCES shop_order(id),
  product_id    BIGINT        NULL REFERENCES product(id),
  sku           VARCHAR(50),
  product_name  VARCHAR(255)  NOT NULL,
  unit_price    NUMERIC(12,2) NOT NULL,
  quantity      INT           NOT NULL CHECK (quantity > 0),
  line_total    NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_order_email        ON shop_order (email); -- find orders by email
CREATE INDEX IF NOT EXISTS idx_shop_order_user_id      ON shop_order (user_id); -- find orders by user ID (my orders)
CREATE INDEX IF NOT EXISTS idx_shop_order_status       ON shop_order (status); -- find orders by status (pending, paid, shipped, etc.) (by admin)
CREATE INDEX IF NOT EXISTS idx_shop_order_item_order   ON shop_order_item (order_id); -- find items by order ID (for order details) (load line items for this order)
