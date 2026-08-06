package com.yourstore.online_store_api.notification;

/**
 * Published when an order becomes {@code PAID} (Stripe webhook → {@code OrderServiceImpl#markPaidFromStripeCheckout}).
 *
 * <p>Published <em>inside</em> the payment {@code @Transactional} method so that
 * {@code @TransactionalEventListener(phase = AFTER_COMMIT)} listeners (guide 06 Step 4)
 * run only after {@code PAID} is committed — email failures cannot roll back payment.
 *
 * <p>Carry {@code orderId} only; listeners reload the order (avoids detached/lazy issues).
 */
public record OrderPaidEvent(Long orderId) {
}
