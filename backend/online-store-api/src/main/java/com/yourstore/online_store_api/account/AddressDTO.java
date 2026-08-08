package com.yourstore.online_store_api.account;

import java.time.LocalDateTime;

public record AddressDTO(
        Long id,
        String label,
        String recipientName,
        String phone,
        String line1,
        String line2,
        String city,
        String province,
        String postal,
        String country,
        boolean isDefault,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
