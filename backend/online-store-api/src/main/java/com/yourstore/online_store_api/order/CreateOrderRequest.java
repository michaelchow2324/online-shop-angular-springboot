package com.yourstore.online_store_api.order;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// in spring boot 3, we can use record for request dto because it is simple and immutable.

// Before spring boot 3, we use class for request dto because jackson need to call no-args constructor and setters to create instance.
// With a class, Jackson used to do:

// 1. new CreateOrderRequest()          // no-args constructor
// 2. setEmail(...), setItems(...)      // setters from JSON fields

// With a record, there are no setters. Jackson does:
// 1. Read JSON fields
// 2. Call the record’s canonical constructor with those values
// 3. Done — immutable instance


/**
 * Request DTO for {@code POST /api/orders}.
 *
 * Why a separate request DTO (not OrderDTO / not the entity):
 * - Input and output shapes differ: the client only sends product ids + quantities
 *   and shipping details; the server computes prices and totals.
 * - Security: never trust client-sent unitPrice / subtotal / total (price tampering).
 * - Validation belongs on the inbound contract ({@code @NotBlank}, {@code @Min}, etc.).
 * - Keeps the API contract independent of the JPA entity ({@link ShopOrder}).
 *
 * Flow: Controller receives CreateOrderRequest → Service loads products from DB,
 * builds ShopOrder + ShopOrderItem snapshots → returns {@link OrderDTO}.
 */
@Getter
@Setter
@NoArgsConstructor
public class CreateOrderRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;

    @NotBlank(message = "Shipping name is required")
    private String shippingName;

    /** Optional — schema allows null. */
    private String shippingPhone;

    @NotBlank(message = "Shipping line 1 is required")
    private String shippingLine1;

    /** Optional apartment / unit line. */
    private String shippingLine2;

    @NotBlank(message = "Shipping city is required")
    private String shippingCity;

    @NotBlank(message = "Shipping province is required")
    private String shippingProvince;

    @NotBlank(message = "Shipping postal is required")
    private String shippingPostal;

    /** Defaults to "CA" in the service if blank; non-CA is rejected for now. */
    private String shippingCountry;

    /**
     * {@code @NotEmpty} = list must have ≥ 1 element.
     * {@code @Valid} = cascade validation into each {@link OrderItemRequest}.
     */
    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<OrderItemRequest> items;

    /**
     * One cart line in the create-order request.
     * Only productId + quantity — no price fields (server prices from Product table).
     */
    @Getter
    @Setter
    @NoArgsConstructor
    public static class OrderItemRequest {

        @NotNull(message = "Product id is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
