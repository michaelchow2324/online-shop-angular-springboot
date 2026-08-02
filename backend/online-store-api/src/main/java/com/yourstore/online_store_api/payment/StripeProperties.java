package com.yourstore.online_store_api.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Stripe API credentials ({@code stripe.*} in application properties).
 */
@ConfigurationProperties(prefix = "stripe")
public record StripeProperties(
        String secretKey,
        String webhookSecret) {
}
