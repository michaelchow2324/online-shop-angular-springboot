package com.yourstore.online_store_api.shipping;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed shipping rates from config ({@code app.shipping.*}).
 *
 * Uses <strong>constructor binding</strong> via Java records: Spring passes YAML
 * values into the canonical constructors (no setters). Immutable after startup.
 *
 * Interview point: prefer {@code @ConfigurationProperties} over scattering
 * {@code @Value} for structured maps / nested objects.
 *
 * Binds YAML like:
 * <pre>
 * app.shipping.zones.ON.fee = 9.95
 * app.shipping.zones.ON.free-threshold = 75
 * </pre>
 * Relaxed binding maps {@code free-threshold} → {@code freeThreshold}.
 *
 * Usage:
 * <pre>
 * properties.zones().get("ON").fee();            // 9.95
 * properties.zones().get("ON").freeThreshold();  // 75
 * </pre>
 */

/*
A record is an immutable data carrier with:

final fields
a canonical all-args constructor
accessors (zones(), fee(), …)
equals / hashCode / toString

perfect for Constructor Binding, and less code
*/
@ConfigurationProperties(prefix = "app.shipping")
public record ShippingProperties(Map<String, ZoneRate> zones) {

    public ShippingProperties {
        zones = zones == null ? Map.of() : Map.copyOf(zones);

        // // Parameter "zones" is the value Spring (or a caller) passed in.
        // if (zones == null) {
        //     // to avoid NPE, create an empty map
        //     // YAML omitted app.shipping.zones — use empty map so .get("ON") does not NPE
        //     zones = Map.of(); //if YAML.zones is empty, create an empty map
        // } else {
        //     // Defensive copy: callers cannot mutate our internal map after construction
        //     // (Map.copyOf also rejects null values inside the map)
        //     zones = Map.copyOf(zones);
        // }
        // // Assigning to "zones" here sets the record's final component field.
    }

    public record ZoneRate(BigDecimal fee, BigDecimal freeThreshold) {
    }
}

/*
 * === Alternative: class + @ConstructorBinding (kept for study) ===
 *
 * Same idea as the record, but a normal class with an explicit constructor.
 * Spring Boot 3: import org.springframework.boot.context.properties.bind.ConstructorBinding;
 *
 * @ConfigurationProperties(prefix = "app.shipping")
 * public class ShippingProperties {
 *
 *     private final Map<String, ZoneRate> zones;
 *
 *     @ConstructorBinding
 *     public ShippingProperties(Map<String, ZoneRate> zones) {
 *         this.zones = zones == null ? Map.of() : Map.copyOf(zones);
 *     }
 *
 *     public Map<String, ZoneRate> getZones() {
 *         return zones;
 *     }
 *
 *     public static class ZoneRate {
 *
 *         private final BigDecimal fee;
 *         private final BigDecimal freeThreshold;
 *
 *         @ConstructorBinding
 *         public ZoneRate(BigDecimal fee, BigDecimal freeThreshold) {
 *             this.fee = fee;
 *             this.freeThreshold = freeThreshold;
 *         }
 *
 *         public BigDecimal getFee() {
 *             return fee;
 *         }
 *
 *         public BigDecimal getFreeThreshold() {
 *             return freeThreshold;
 *         }
 *     }
 * }
 *
 * usage:
 *   properties.getZones().get("ON").getFee();
 *
 * Note: with a single constructor, Boot 3 often constructor-binds even without
 * the annotation; @ConstructorBinding makes the intent obvious.
 * A record is shorter for the same immutable constructor-bound result.
 */

/*
 * === Previous version: setter / JavaBean binding (kept for study) ===
 *
 * import java.util.HashMap;
 *
 * @ConfigurationProperties(prefix = "app.shipping")
 * public class ShippingProperties {
 *
 *     private Map<String, ZoneRate> zones = new HashMap<>();
 *
 *     public Map<String, ZoneRate> getZones() {
 *         return zones;
 *     }
 *
 *     public void setZones(Map<String, ZoneRate> zones) {
 *         this.zones = zones;
 *     }
 *
 *     public static class ZoneRate {
 *
 *         private BigDecimal fee;
 *         private BigDecimal freeThreshold;
 *
 *         public BigDecimal getFee() {
 *             return fee;
 *         }
 *
 *         public void setFee(BigDecimal fee) {
 *             this.fee = fee;
 *         }
 *
 *         public BigDecimal getFreeThreshold() {
 *             return freeThreshold;
 *         }
 *
 *         public void setFreeThreshold(BigDecimal freeThreshold) {
 *             this.freeThreshold = freeThreshold;
 *         }
 *     }
 * }
 *
 * ShippingProperties Bean after binding:
 *   zones = {
 *     "ON"     → ZoneRate(fee=9.95,  freeThreshold=75)
 *     "ROC"    → ZoneRate(fee=16.95, freeThreshold=120)
 *     "REMOTE" → ZoneRate(fee=24.95, freeThreshold=150)
 *   }
 * usage (setter style):
 *   properties.getZones().get("ON").getFee();            // 9.95
 *   properties.getZones().get("ON").getFreeThreshold();  // 75
 *
 * Why setters?
 * Classic @ConfigurationProperties binding uses the JavaBean style:
 *   new ShippingProperties() / new ZoneRate()
 *   Call setters to fill fields (setFee, setFreeThreshold, setZones)
 * Private fields alone aren’t enough — Spring needs a way to write values
 * (setter, or constructor binding / records).
 *
 * Getters are for your code (and sometimes for reading nested structure).
 * Setters are mainly so Spring can populate the object from YAML.
 */
