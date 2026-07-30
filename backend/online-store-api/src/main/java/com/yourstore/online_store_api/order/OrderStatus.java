package com.yourstore.online_store_api.order;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    FULFILLING,
    SHIPPED,
    CANCELLED,
    REFUNDED
}
