package com.yourstore.online_store_api.order;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "shop_order_item")
public class ShopOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // FetchType.LAZY means that the order will not be loaded from the database until it is needed
    // optional = false means that the order is required
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private ShopOrder order;

    // nullable so the order line survives if the product is later deleted
    @Column(name = "product_id")
    private Long productId;

    @Column(length = 50)
    private String sku;

    // snapshotted at checkout — product.name may change later
    @NotBlank(message = "Product name is required")
    @Column(name = "product_name", nullable = false)
    private String productName;

    @NotNull(message = "Unit price is required")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;

    // unit_price × quantity at checkout; stored so the charged amount stays fixed
    @NotNull(message = "Line total is required")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "line_total", nullable = false)
    private BigDecimal lineTotal;
}
