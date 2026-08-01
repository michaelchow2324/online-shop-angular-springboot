package com.yourstore.online_store_api.shipping;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request for {@code POST /api/shipping/quote}.
 * Client sends product ids + qty + address province; server recomputes subtotal from DB prices.
 */
@Getter
@Setter
@NoArgsConstructor
public class ShippingQuoteRequest {

    @NotBlank(message = "Shipping province is required")
    private String shippingProvince;

    /** Defaults to CA in the service if blank. */
    private String shippingCountry;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<QuoteItemRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class QuoteItemRequest {

        @NotNull(message = "Product id is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
