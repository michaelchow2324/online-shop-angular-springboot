package com.yourstore.online_store_api.shipping;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Result of {@link ShippingService#quote}.
 * Used by checkout UI ({@code fee}, {@code amountToFreeShipping}, tax estimate)
 * and order create ({@code fee}, {@code zone}).
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ShippingQuoteDTO {

    private String zone;
    private String method;
    private BigDecimal fee;
    private BigDecimal freeThreshold;
    private BigDecimal amountToFreeShipping;
    /** Optional ETA copy; null if unused. */
    private Integer estimatedDaysMin;
    private Integer estimatedDaysMax;

    /** Estimated tax on (cart subtotal + shipping) for the destination province. */
    private BigDecimal tax;
    private BigDecimal taxRate;
    private String taxName;
    /** subtotal + fee + tax (server-side estimate for checkout UI). */
    private BigDecimal estimatedTotal;
}
