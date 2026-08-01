package com.yourstore.online_store_api.shipping;

import java.math.BigDecimal;

public interface ShippingService {

    /**
     * Quote from cart lines — loads product prices from DB (do not trust client subtotal).
     */
    ShippingQuoteDTO quote(ShippingQuoteRequest request);

    /**
     * Zone-based quote when subtotal is already known (e.g. order create).
     *
     * @param country  must be CA (after normalize)
     * @param province e.g. ON, BC, YT (case-insensitive)
     * @param subtotal server-computed cart/order subtotal
     */
    ShippingQuoteDTO quote(String country, String province, BigDecimal subtotal);
}
