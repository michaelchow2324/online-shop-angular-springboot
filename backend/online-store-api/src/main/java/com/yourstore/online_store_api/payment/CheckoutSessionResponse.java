package com.yourstore.online_store_api.payment;

/**
 * Response for {@code POST /api/checkout/sessions}.
 */

// usually we use record for response dto because it is simple and immutable.
public record CheckoutSessionResponse(String orderNumber, String checkoutUrl) {
}
