-- Guide 09: optional display name + shipping address book (V15 already used for tax)

ALTER TABLE customer_user
  ADD COLUMN IF NOT EXISTS display_name VARCHAR(255);

CREATE TABLE IF NOT EXISTS customer_address (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT       NOT NULL REFERENCES customer_user(id) ON DELETE CASCADE,
  label           VARCHAR(64)  NOT NULL DEFAULT 'Home',
  recipient_name  VARCHAR(255) NOT NULL,
  phone           VARCHAR(64),
  line1           VARCHAR(255) NOT NULL,
  line2           VARCHAR(255),
  city            VARCHAR(128) NOT NULL,
  province        VARCHAR(8)   NOT NULL,
  postal          VARCHAR(16)  NOT NULL,
  country         CHAR(2)      NOT NULL DEFAULT 'CA',
  is_default      BOOLEAN      NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_address_user
  ON customer_address (user_id);

-- At most one default address per user (Postgres partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_address_one_default
  ON customer_address (user_id)
  WHERE is_default = true;
