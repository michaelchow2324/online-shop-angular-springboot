package com.yourstore.online_store_api.shipping;

import java.math.BigDecimal;

public interface ShippingService {

    /**
     * Zone-based shipping quote for Canada.
     *
     * @param country  must be CA (after normalize)
     * @param province e.g. ON, BC, YT (case-insensitive)
     * @param subtotal server-computed cart/order subtotal
     */
    ShippingQuoteDTO quote(String country, String province, BigDecimal subtotal);
}
