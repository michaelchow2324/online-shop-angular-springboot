package com.yourstore.online_store_api.notification;

/**
 * Published when an order becomes {@code REFUNDED} (admin full Stripe refund).
 * Listeners must run after commit so SMTP failures do not undo refund status.
 */
public record OrderRefundedEvent(Long orderId) {
}
