package com.yourstore.online_store_api.shipping;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Checkout UI: quote shipping from cart lines + province (server recomputes subtotal).
 */
@RestController
@RequestMapping("/api/shipping")
@CrossOrigin(origins = "http://localhost:4200")
public class ShippingController {

    private final ShippingService shippingService;

    ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @PostMapping("/quote")
    public ResponseEntity<ShippingQuoteDTO> createQuote(
            @Valid @RequestBody ShippingQuoteRequest request) {
        return ResponseEntity.ok(shippingService.quote(request));
    }
}
