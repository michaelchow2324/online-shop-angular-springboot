package com.yourstore.online_store_api.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Body for {@code POST /api/admin/orders/{orderNumber}/ship} (guide 07).
 * Carrier is a free-form code (e.g. {@code canada_post}, {@code chit_chats}).
 */
@Getter
@Setter
@NoArgsConstructor
public class ShipOrderRequest {

    @NotBlank(message = "Carrier is required")
    private String carrier;

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;
}
