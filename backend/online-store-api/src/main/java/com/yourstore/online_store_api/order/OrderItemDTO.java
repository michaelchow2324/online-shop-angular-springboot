package com.yourstore.online_store_api.order;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO for one line inside {@link OrderDTO}.
 *
 * Mirrors the checkout snapshot on {@link ShopOrderItem}: name/sku/unitPrice are
 * copied at order time so later product catalog changes do not rewrite history.
 *
 * {@code imageUrl} is resolved live from the current product media (not snapshotted).
 * May be null if the product or media was removed.
 *
 * {@code lineTotal} = unitPrice × quantity (also stored on the entity, not only derived).
 * Used only in responses — create requests use {@link CreateOrderRequest.OrderItemRequest}
 * (productId + quantity only).
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDTO {

    private Long productId;
    private String sku;
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal lineTotal;
    /** Live catalog image URL; null if product/media missing. */
    private String imageUrl;
}
