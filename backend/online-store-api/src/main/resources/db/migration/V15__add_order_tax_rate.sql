-- Guide 08: snapshot the GST/HST rate applied at checkout (Ontario seller / CA destination).
ALTER TABLE shop_order
  ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(7,4),
  ADD COLUMN IF NOT EXISTS tax_name VARCHAR(32);
