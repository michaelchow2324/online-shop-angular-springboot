package com.yourstore.online_store_api.payment;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yourstore.online_store_api.auth.CustomerPrincipal;
import com.yourstore.online_store_api.order.CreateOrderRequest;

import jakarta.validation.Valid;

/**
 * Starts Stripe Checkout: create pending order + hosted payment session.
 *
 * {@code /api/checkout/**} is permitAll — JWT is optional.
 * When Bearer JWT is present, that means the user is authenticated and JwtAuthenticationFilter fills the principal and we
 * attach {@code user_id} + force account email (guide 05 step 6).
 */
@RestController
@RequestMapping("/api/checkout")
@CrossOrigin(origins = "http://localhost:4200")
public class CheckoutController {

    private final PaymentService paymentService;

    CheckoutController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/sessions")
    public ResponseEntity<CheckoutSessionResponse> createSession(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal CustomerPrincipal principal) {
        // principal is null for guests (no Authorization header)
        CheckoutSessionResponse response = paymentService.createCheckoutSession(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
