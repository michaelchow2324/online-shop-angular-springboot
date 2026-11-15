-- Admin TOTP (authenticator app) — secret stored only after setup start; enabled after confirm

ALTER TABLE customer_user
  ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE customer_user
  ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(64);
