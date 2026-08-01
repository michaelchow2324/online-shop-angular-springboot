package com.yourstore.online_store_api.shipping;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Result of {@link ShippingService#quote}.
 * Used by checkout UI ({@code fee}, {@code amountToFreeShipping}) and order create ({@code fee}, {@code zone}).
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
}
