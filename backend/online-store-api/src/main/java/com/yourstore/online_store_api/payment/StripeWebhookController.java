package com.yourstore.online_store_api.payment;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stripe.exception.SignatureVerificationException;
import com.yourstore.common.NotFoundException;

/**
 * Stripe → our server. Keep public (no JWT); auth is the signature.
 * Must receive the raw body string — do not parse JSON before verify.
 */
// JWT = JSON Web Token — a signed string the server gives a user after login, then the client sends on later requests to prove who they are.
// Not used for Stripe webhooks — those use Stripe-Signature instead. JWTs are for your users calling your API (orders, profile, admin).
// JWT: used for authentication of users calling your API (orders, profile, admin).
// but for Stripe webhooks, we use Stripe-Signature instead.
// Stripe-Signature is a signed string the server gives a user after login, then the client sends on later requests to prove who they are.

@RestController
@RequestMapping("/api/payments/stripe")
public class StripeWebhookController {

    private final PaymentService paymentService;

    StripeWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handle(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            paymentService.handleStripeWebhook(payload, sigHeader);
            return ResponseEntity.ok("ok");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (NotFoundException e) {
            // Let Stripe retry (e.g. rare race before session id is saved)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
