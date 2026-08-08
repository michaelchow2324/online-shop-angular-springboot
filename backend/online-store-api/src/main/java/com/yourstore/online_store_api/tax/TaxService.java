package com.yourstore.online_store_api.tax;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.yourstore.online_store_api.tax.TaxProperties.ProvinceRate;

/**
 * Destination-based GST/HST for CA shipments (guide 08).
 * Taxable base = merchandise subtotal + shipping (taxable goods).
 */
@Service
public class TaxService {

    private final TaxProperties taxProperties;

    public TaxService(TaxProperties taxProperties) {
        this.taxProperties = taxProperties;
    }

    public TaxQuote quote(String province, BigDecimal subtotal, BigDecimal shippingFee) {
        if (province == null || province.isBlank()) {
            throw new IllegalArgumentException("Shipping province is required for tax");
        }
        if (subtotal == null) {
            throw new IllegalArgumentException("Subtotal is required for tax");
        }
        if (shippingFee == null) {
            throw new IllegalArgumentException("Shipping fee is required for tax");
        }

        String code = province.trim().toUpperCase(Locale.ROOT); // ROOT = no language rule, good for code (e.g. e in french becomes e^)
        ProvinceRate rateConfig = taxProperties.rates().getOrDefault(code, taxProperties.defaultRate());
        if (rateConfig == null || rateConfig.rate() == null) {
            throw new IllegalStateException("Missing tax rate config for province: " + code);
        }

        BigDecimal rate = rateConfig.rate().setScale(4, RoundingMode.HALF_UP);
        String name = (rateConfig.name() == null || rateConfig.name().isBlank())
                ? "TAX"
                : rateConfig.name().trim();

        BigDecimal taxable = subtotal
                .add(shippingFee)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal amount = taxable
                .multiply(rate)
                .setScale(2, RoundingMode.HALF_UP);

        return new TaxQuote(rate, name, taxable, amount);
    }
}
