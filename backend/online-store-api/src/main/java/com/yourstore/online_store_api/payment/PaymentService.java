package com.yourstore.online_store_api.payment;

import com.stripe.exception.SignatureVerificationException;
import com.yourstore.online_store_api.auth.CustomerPrincipal;
import com.yourstore.online_store_api.order.CreateOrderRequest;

public interface PaymentService {

    /**
     * Creates a pending order, opens a Stripe Checkout Session for its total,
     * stores {@code stripe_checkout_session_id}, and returns the hosted Checkout URL.
     *
     * @param principal logged-in customer from JWT, or {@code null} for guest checkout
     */
    CheckoutSessionResponse createCheckoutSession(CreateOrderRequest request, CustomerPrincipal principal);

    /**
     * Verifies Stripe webhook signature and marks the order paid on
     * {@code checkout.session.completed} (idempotent).
     *
     * @param payload   raw request body (must not be re-serialized JSON)
     * @param sigHeader {@code Stripe-Signature} header value
     */
    void handleStripeWebhook(String payload, String sigHeader) throws SignatureVerificationException;
}
