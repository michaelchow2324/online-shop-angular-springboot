package com.yourstore.online_store_api.payment;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.stripe.Stripe;

@Configuration
@EnableConfigurationProperties({ StripeProperties.class, CheckoutProperties.class })
public class StripeConfig {

    StripeConfig(StripeProperties stripeProperties) {
        Stripe.apiKey = stripeProperties.secretKey(); // after binding properties to stripeProperties, pass the secret key to Stripe API
    }
}
