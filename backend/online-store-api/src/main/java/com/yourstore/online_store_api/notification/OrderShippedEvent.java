package com.yourstore.online_store_api.notification;

/**
 * Published when an order becomes {@code SHIPPED} (admin ship → guide 07).
 *
 * <p>Same AFTER_COMMIT pattern as {@link OrderPaidEvent}: publish inside the ship transaction;
 * mail listeners run after commit so SMTP failures do not undo shipped status.
 *
 * <p>Carry {@code orderId} only; listeners reload the order for tracking / email content.
 */
public record OrderShippedEvent(Long orderId) {
}
