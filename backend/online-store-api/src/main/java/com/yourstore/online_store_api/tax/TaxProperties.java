package com.yourstore.online_store_api.tax;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Canadian destination GST/HST rates ({@code app.tax.*}).
 * Ontario seller MVP: charge combined GST/HST by shipping province; store the
 * rate used on each order. Dual-tax provinces currently collect federal GST only
 * (PST/QST not registered yet).
 */
@ConfigurationProperties(prefix = "app.tax")
public record TaxProperties(Map<String, ProvinceRate> rates, ProvinceRate defaultRate) {

    public TaxProperties {
        rates = rates == null ? Map.of() : Map.copyOf(rates);
        if (defaultRate == null) {
            defaultRate = new ProvinceRate(new BigDecimal("0.05"), "GST");
        }
    }

    public record ProvinceRate(BigDecimal rate, String name) {
    }
}
