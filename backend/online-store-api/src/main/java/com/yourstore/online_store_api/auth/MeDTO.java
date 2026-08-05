package com.yourstore.online_store_api.auth;

import java.time.LocalDateTime;

/**
 * Response DTO for "who am I?" APIs ({@code GET /api/auth/me}, register/verify responses).
 *
 * Why not return {@link CustomerUser} directly?
 * - Never leak {@code passwordHash} (or other internal fields) in JSON
 * - Stable API shape if the entity/table changes later
 * - {@code emailVerifiedAt == null} means "not verified yet" (claim has not run)
 *
 * Record = immutable response object; Jackson serializes components as JSON fields.
 */
public record MeDTO(
        Long id,
        String email,
        String role,
        LocalDateTime emailVerifiedAt
) {
}
