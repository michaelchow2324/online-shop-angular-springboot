-- Admin refund metadata (full Stripe refund via POST /api/admin/orders/{orderNumber}/refund)
ALTER TABLE shop_order
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITHOUT TIME ZONE,
  ADD COLUMN IF NOT EXISTS stripe_refund_id VARCHAR(255);
