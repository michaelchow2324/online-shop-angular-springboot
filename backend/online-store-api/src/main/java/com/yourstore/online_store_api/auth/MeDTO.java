package com.yourstore.online_store_api.auth;

import java.time.LocalDateTime;

public record MeDTO(
        Long id,
        String email,
        String role,
        LocalDateTime emailVerifiedAt
) {
}
