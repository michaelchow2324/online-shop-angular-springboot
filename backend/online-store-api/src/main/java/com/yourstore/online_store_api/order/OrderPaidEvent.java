package com.yourstore.online_store_api.order;

/**
 * Published after an order is marked {@link OrderStatus#PAID} (Stripe webhook).
 * Email / fulfillment listeners come in later guides — do not send mail from payment code.
 */
public record OrderPaidEvent(Long orderId) {
}
