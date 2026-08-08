package com.yourstore.online_store_api.account;

import java.util.Set;

/** ISO 3166-2 CA subdivision codes accepted for shipping / address book. */
public final class CanadaProvinces {

    public static final Set<String> CODES = Set.of(
            "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT");

    private CanadaProvinces() {
    }

    public static boolean isKnown(String province) {
        return province != null && CODES.contains(province.trim().toUpperCase());
    }
}
