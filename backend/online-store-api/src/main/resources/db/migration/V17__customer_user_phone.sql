-- Persist phone collected at registration (guide follow-up)

ALTER TABLE customer_user
  ADD COLUMN IF NOT EXISTS phone VARCHAR(32);

ALTER TABLE customer_user
  ADD COLUMN IF NOT EXISTS country_code VARCHAR(8);
