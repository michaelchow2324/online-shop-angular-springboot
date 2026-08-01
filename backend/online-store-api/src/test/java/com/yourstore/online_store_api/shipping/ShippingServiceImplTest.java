package com.yourstore.online_store_api.shipping;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.shipping.ShippingProperties.ZoneRate;

/**
 * Pure unit tests for {@link ShippingServiceImpl#quote(String, String, BigDecimal)}.
 * Hand-built {@link ShippingProperties} — no Spring context.
 */
@ExtendWith(MockitoExtension.class)
class ShippingServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    private ShippingServiceImpl shippingService;

    // Hand-built ShippingProperties — no Spring context. in unit test we dont load spring context
    @BeforeEach
    void setUp() {
        ShippingProperties properties = new ShippingProperties(Map.of(
                "ON", new ZoneRate(new BigDecimal("9.95"), new BigDecimal("75")),
                "ROC", new ZoneRate(new BigDecimal("16.95"), new BigDecimal("120")),
                "REMOTE", new ZoneRate(new BigDecimal("24.95"), new BigDecimal("150"))));
        shippingService = new ShippingServiceImpl(properties, productRepository);
    }

    @Test
    void quote_ON_subtotal50_returnsFeeAndAmountToFree() {
        ShippingQuoteDTO quote = shippingService.quote("CA", "on", new BigDecimal("50.00"));

        assertThat(quote.getZone()).isEqualTo("ON");
        assertThat(quote.getMethod()).isEqualTo("regular");
        assertThat(quote.getFee()).isEqualByComparingTo("9.95");
        assertThat(quote.getFreeThreshold()).isEqualByComparingTo("75.00");
        assertThat(quote.getAmountToFreeShipping()).isEqualByComparingTo("25.00");
    }

    @Test
    void quote_ON_subtotal75_isFree() {
        ShippingQuoteDTO quote = shippingService.quote("CA", "ON", new BigDecimal("75.00"));

        assertThat(quote.getFee()).isEqualByComparingTo("0.00");
        assertThat(quote.getAmountToFreeShipping()).isEqualByComparingTo("0.00");
    }

    @Test
    void quote_BC_subtotal100_isRocFee() {
        ShippingQuoteDTO quote = shippingService.quote("CA", "BC", new BigDecimal("100.00"));

        assertThat(quote.getZone()).isEqualTo("ROC");
        assertThat(quote.getFee()).isEqualByComparingTo("16.95");
    }

    @Test
    void quote_BC_subtotal120_isFree() {
        ShippingQuoteDTO quote = shippingService.quote("CA", "BC", new BigDecimal("120.00"));

        assertThat(quote.getFee()).isEqualByComparingTo("0.00");
    }

    @Test
    void quote_YT_belowThreshold_isRemoteFee() {
        ShippingQuoteDTO quote = shippingService.quote("CA", "YT", new BigDecimal("50.00"));

        assertThat(quote.getZone()).isEqualTo("REMOTE");
        assertThat(quote.getFee()).isEqualByComparingTo("24.95");
    }

    @Test
    void quote_US_throws() {
        assertThatThrownBy(() -> shippingService.quote("US", "WA", new BigDecimal("50.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("CA");
    }
}
