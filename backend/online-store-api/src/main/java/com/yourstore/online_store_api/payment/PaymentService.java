package com.yourstore.online_store_api.payment;

import com.yourstore.online_store_api.order.CreateOrderRequest;

public interface PaymentService {

    /**
     * Creates a pending order, opens a Stripe Checkout Session for its total,
     * stores {@code stripe_checkout_session_id}, and returns the hosted Checkout URL.
     */
    CheckoutSessionResponse createCheckoutSession(CreateOrderRequest request);
}
