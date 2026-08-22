package com.yourstore.online_store_api.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.stripe.exception.StripeException;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;

/**
 * Thin Stripe Refund wrapper so {@code OrderServiceImpl} can refund without a
 * circular dependency on {@link PaymentServiceImpl}.
 */
@Component
public class StripeRefundClient {

    private static final Logger log = LoggerFactory.getLogger(StripeRefundClient.class);

    /**
     * Full refund against a PaymentIntent. Returns the Stripe refund id.
     *
     * @throws IllegalArgumentException when Stripe rejects the refund (caller maps to 400)
     */
    public String createFullRefund(String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new IllegalArgumentException("Payment intent id is required to refund");
        }
        try {
            Refund refund = Refund.create(
                    RefundCreateParams.builder()
                            .setPaymentIntent(paymentIntentId.trim())
                            .build());
            log.info("Created Stripe refund {} for payment_intent {}", refund.getId(), paymentIntentId);
            return refund.getId();
        } catch (StripeException ex) {
            log.error("Stripe refund failed for {}: {}", paymentIntentId, ex.getMessage());
            throw new IllegalArgumentException("Stripe refund failed: " + ex.getMessage(), ex);
        }
    }
}
