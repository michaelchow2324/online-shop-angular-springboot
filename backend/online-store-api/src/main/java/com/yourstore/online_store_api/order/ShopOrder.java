package com.yourstore.online_store_api.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "shop_order")
public class ShopOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Order number is required")
    @Column(name = "order_number", nullable = false, unique = true, length = 32)
    private String orderNumber;

    @Column(name = "user_id")
    private Long userId;

    @NotBlank(message = "Email is required")
    @Column(nullable = false)
    @Email(message = "Invalid email address")
    private String email;

    @NotNull(message = "Status is required")
    @Column(nullable = false, length = 32)
    @Enumerated(EnumType.STRING) // tells JPA to store your Java enum as its name in the DB (e.g. "PAID"), not as a number. e.g. the String "PENDING_PAYMENT" instead of the number 0 is stored in the DB.
    private OrderStatus status;

    @NotBlank(message = "Currency is required")
    @Column(nullable = false, length = 3)
    private String currency;

    @NotNull(message = "Subtotal is required")
    @Column(nullable = false)
    @Digits(integer = 10, fraction = 2)
    private BigDecimal subtotal; // we store this because an order is a snapshot of what was bought at checkout time

    @NotNull(message = "Shipping fee is required")
    @Digits(integer = 10, fraction = 2)
    @Column(name = "shipping_fee", nullable = false)
    private BigDecimal shippingFee;

    @NotNull(message = "Tax is required")
    @Digits(integer = 10, fraction = 2)
    @Column(nullable = false)
    private BigDecimal tax;

    @NotNull(message = "Total is required")
    @Digits(integer = 10, fraction = 2)
    @Column(nullable = false)
    private BigDecimal total;

    @NotBlank(message = "Shipping name is required")
    @Column(name = "shipping_name", nullable = false)
    private String shippingName;

    @Column(name = "shipping_phone", length = 64)
    private String shippingPhone;

    @NotBlank(message = "Shipping line 1 is required")
    @Column(name = "shipping_line1", nullable = false)
    private String shippingLine1;

    @Column(name = "shipping_line2")
    private String shippingLine2;

    @NotBlank(message = "Shipping city is required")
    @Column(name = "shipping_city", nullable = false, length = 128)
    private String shippingCity;

    @NotBlank(message = "Shipping province is required")
    @Column(name = "shipping_province", nullable = false, length = 8)
    private String shippingProvince;

    @NotBlank(message = "Shipping postal is required")
    @Column(name = "shipping_postal", nullable = false, length = 16)
    private String shippingPostal;

    @NotBlank(message = "Shipping country is required")
    @Column(name = "shipping_country", nullable = false, length = 2)
    private String shippingCountry;

    @Column(name = "shipping_zone", length = 16)
    private String shippingZone;

    @NotBlank(message = "Shipping method is required")
    @Column(name = "shipping_method", nullable = false, length = 32)
    private String shippingMethod;

    // filled when shipped
    @Column(length = 64)
    private String carrier;

    @Column(name = "tracking_number", length = 128)
    private String trackingNumber;

    // filled when Stripe Checkout session is created (guide 03)
    @Column(name = "stripe_checkout_session_id", unique = true)
    private String stripeCheckoutSessionId;

    // filled when payment is confirmed via webhook
    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // cascade = CascadeType.ALL means that when the ShopOrder object is deleted, all the ShopOrderItem objects will be deleted
    // orphanRemoval = true means that when the ShopOrderItem object is deleted, it will be removed from the list inside the ShopOrder object 
    // if a ShopOrderItem is removed from ShopOrder.items, Hibernate deletes that item row from the DB.
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShopOrderItem> items = new ArrayList<>();

    public void addItem(ShopOrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(ShopOrderItem item) {
        items.remove(item); // remove the item from the list inside the ShopOrder object
        item.setOrder(null); // remove the reference to the ShopOrder object from the item
    }
}
