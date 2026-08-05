CREATE TABLE IF NOT EXISTS customer_user (
  id                 BIGSERIAL PRIMARY KEY,
  email              VARCHAR(255) NOT NULL UNIQUE,
  password_hash      VARCHAR(255) NOT NULL,
  email_verified_at  TIMESTAMP WITHOUT TIME ZONE,
  role               VARCHAR(32)  NOT NULL DEFAULT 'USER',
  created_at         TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Optional: email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_token (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT NOT NULL REFERENCES customer_user(id),
  token        VARCHAR(64) NOT NULL UNIQUE,
  expires_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  used_at      TIMESTAMP WITHOUT TIME ZONE
);

ALTER TABLE shop_order
  ADD CONSTRAINT fk_shop_order_user
  FOREIGN KEY (user_id) REFERENCES customer_user(id);
