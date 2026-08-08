package com.yourstore.online_store_api.tax;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TaxServiceTest {

    private TaxService taxService;

    @BeforeEach
    void setUp() {
        TaxProperties properties = new TaxProperties(
                Map.of(
                        "ON", new TaxProperties.ProvinceRate(new BigDecimal("0.13"), "HST"),
                        "NS", new TaxProperties.ProvinceRate(new BigDecimal("0.14"), "HST")),
                new TaxProperties.ProvinceRate(new BigDecimal("0.05"), "GST"));
        taxService = new TaxService(properties);
    }

    @Test
    void quote_ON_appliesHstOnSubtotalPlusShipping() {
        TaxQuote quote = taxService.quote("on", new BigDecimal("50.00"), new BigDecimal("9.95"));

        assertThat(quote.name()).isEqualTo("HST");
        assertThat(quote.rate()).isEqualByComparingTo("0.1300");
        assertThat(quote.taxableAmount()).isEqualByComparingTo("59.95");
        assertThat(quote.amount()).isEqualByComparingTo("7.79");
    }

    @Test
    void quote_AB_fallsBackToDefaultGst() {
        TaxQuote quote = taxService.quote("AB", new BigDecimal("100.00"), BigDecimal.ZERO);

        assertThat(quote.name()).isEqualTo("GST");
        assertThat(quote.rate()).isEqualByComparingTo("0.0500");
        assertThat(quote.amount()).isEqualByComparingTo("5.00");
    }

    @Test
    void quote_blankProvince_rejected() {
        assertThatThrownBy(() -> taxService.quote(" ", new BigDecimal("10"), BigDecimal.ZERO))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("province");
    }
}
