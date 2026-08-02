package com.yourstore.online_store_api.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Browser redirect URLs after Stripe Checkout ({@code app.checkout.*}).
 */
@ConfigurationProperties(prefix = "app.checkout")
public record CheckoutProperties(
        String successUrl,
        String cancelUrl) {
}
