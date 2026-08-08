package com.yourstore.online_store_api.shipping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.shipping.ShippingProperties.ZoneRate;
import com.yourstore.online_store_api.shipping.ShippingQuoteRequest.QuoteItemRequest;
import com.yourstore.online_store_api.tax.TaxQuote;
import com.yourstore.online_store_api.tax.TaxService;

/**
 * Implements guide 02 shipping rules:
 * <pre>
 * CA only
 * NL, NT, NU, YT → REMOTE
 * ON → ON
 * else → ROC
 * fee = 0 if subtotal &gt;= freeThreshold, else zone fee
 * </pre>
 */
@Service
public class ShippingServiceImpl implements ShippingService {

    private static final String CANADA = "CA";
    private static final String METHOD_REGULAR = "regular";
    private static final Set<String> REMOTE_PROVINCES = Set.of("NL", "NT", "NU", "YT");

    private final ShippingProperties shippingProperties;
    private final ProductRepository productRepository;
    private final TaxService taxService;

    ShippingServiceImpl(
            ShippingProperties shippingProperties,
            ProductRepository productRepository,
            TaxService taxService) {
        this.shippingProperties = shippingProperties;
        this.productRepository = productRepository;
        this.taxService = taxService;
    }

    @Override
    public ShippingQuoteDTO quote(ShippingQuoteRequest request) {
        String country = (request.getShippingCountry() == null || request.getShippingCountry().isBlank())
                ? CANADA
                : request.getShippingCountry();

        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        for (QuoteItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + item.getProductId()));
            if (!product.isActive()) {
                throw new IllegalArgumentException(
                        "Product is not active: " + item.getProductId());
            }
            BigDecimal lineTotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(item.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);
        }

        return quote(country, request.getShippingProvince(), subtotal);
    }

    @Override
    public ShippingQuoteDTO quote(String country, String province, BigDecimal subtotal) {
        if (country == null || country.isBlank()) {
            throw new IllegalArgumentException("Shipping country is required");
        }
        if (province == null || province.isBlank()) {
            throw new IllegalArgumentException("Shipping province is required");
        }
        if (subtotal == null) {
            throw new IllegalArgumentException("Subtotal is required");
        }

        String normalizedCountry = country.trim().toUpperCase();
        if (!CANADA.equals(normalizedCountry)) {
            throw new IllegalArgumentException("Shipping country must be CA");
        }

        String normalizedProvince = province.trim().toUpperCase();
        String zone = resolveZone(normalizedProvince); // ON, ROC, REMOTE

        ZoneRate rate = shippingProperties.zones().get(zone);
        if (rate == null || rate.fee() == null || rate.freeThreshold() == null) {
            throw new IllegalStateException("Missing shipping rate config for zone: " + zone);
        }

        BigDecimal fee = rate.fee().setScale(2, RoundingMode.HALF_UP);
        BigDecimal freeThreshold = rate.freeThreshold().setScale(2, RoundingMode.HALF_UP);
        BigDecimal normalizedSubtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        // compareTo — never use == for BigDecimal
        boolean freeShipping = normalizedSubtotal.compareTo(freeThreshold) >= 0;
        BigDecimal chargedFee = freeShipping
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : fee;

        BigDecimal amountToFree = freeThreshold.subtract(normalizedSubtotal).max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        int[] eta = estimatedDays(zone);
        TaxQuote tax = taxService.quote(normalizedProvince, normalizedSubtotal, chargedFee);
        BigDecimal estimatedTotal = normalizedSubtotal
                .add(chargedFee)
                .add(tax.amount())
                .setScale(2, RoundingMode.HALF_UP);

        return new ShippingQuoteDTO(
                zone,
                METHOD_REGULAR,
                chargedFee,
                freeThreshold,
                amountToFree,
                eta[0],
                eta[1],
                tax.amount(),
                tax.rate(),
                tax.name(),
                estimatedTotal);
    }

    private static String resolveZone(String province) {
        if (REMOTE_PROVINCES.contains(province)) {
            return "REMOTE";
        }
        if ("ON".equals(province)) {
            return "ON";
        }
        return "ROC";
    }

    /** Optional UX copy from guide 02. */
    private static int[] estimatedDays(String zone) {
        return switch (zone) {
            case "ON" -> new int[] { 1, 3 };
            case "ROC" -> new int[] { 5, 10 };
            case "REMOTE" -> new int[] { 10, 21 };
            default -> new int[] { 5, 10 };
        };
    }
}
