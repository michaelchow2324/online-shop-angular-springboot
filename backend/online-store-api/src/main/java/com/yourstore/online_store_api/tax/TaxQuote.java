package com.yourstore.online_store_api.tax;

import java.math.BigDecimal;

/**
 * Result of {@link TaxService#quote} — amount is already rounded to 2 decimals.
 */
public record TaxQuote(
        BigDecimal rate,
        String name,
        BigDecimal taxableAmount,
        BigDecimal amount) {
}
