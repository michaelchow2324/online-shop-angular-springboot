package com.yourstore.online_store_api.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO for order APIs ({@code POST /api/orders}, {@code GET /api/orders/{orderNumber}}).
 *
 * Why return a DTO instead of the {@link ShopOrder} JPA entity:
 * - Separation: API JSON contract stays stable if the DB/entity changes.
 * - Security / encapsulation: avoid leaking internal fields or lazy associations by accident.
 * - Serialization safety: entities with lazy {@code items} can cause
 *   LazyInitializationException or huge/circular JSON outside a transaction.
 * - Shape control: include only what the frontend needs (status, money, address, line items).
 *
 * Mapped in the service layer: ShopOrder (+ items) → OrderDTO.
 * Pair with {@link CreateOrderRequest} for write; do not reuse this class as the request body.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {

    private String orderNumber;
    private OrderStatus status;
    private String email;

    private String currency;
    /** Snapshot totals at checkout — not recomputed from live product prices. */
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal tax;
    /** Rate applied at checkout (e.g. 0.13 for ON HST); null on legacy rows. */
    private BigDecimal taxRate;
    /** e.g. HST / GST; null on legacy rows. */
    private String taxName;
    private BigDecimal total;

    private String shippingName;
    private String shippingPhone;
    private String shippingLine1;
    private String shippingLine2;
    private String shippingCity;
    private String shippingProvince;
    private String shippingPostal;
    private String shippingCountry;
    private String shippingZone;
    private String shippingMethod;

    /** Set when the order is shipped; null while pending/paid. */
    private String carrier;
    private String trackingNumber;

    /** Null until payment / shipment events happen. */
    private LocalDateTime paidAt;
    private LocalDateTime shippedAt;
    private LocalDateTime createdAt;

    private List<OrderItemDTO> items;
}
