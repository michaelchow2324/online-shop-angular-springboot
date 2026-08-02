package com.yourstore.online_store_api.payment;

/**
 * Response for {@code POST /api/checkout/sessions}.
 */
public record CheckoutSessionResponse(String orderNumber, String checkoutUrl) {
}
