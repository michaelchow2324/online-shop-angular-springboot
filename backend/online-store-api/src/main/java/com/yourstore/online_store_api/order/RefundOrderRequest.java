package com.yourstore.online_store_api.order;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Optional body for {@code POST /api/admin/orders/{orderNumber}/refund}.
 * Empty body is allowed; reason is stored only in logs for now.
 */
@Getter
@Setter
@NoArgsConstructor
public class RefundOrderRequest {

    /** Optional admin note (not persisted yet). */
    private String reason;
}
