package com.yourstore.online_store_api.auth;

/**
 * "Who is calling this API?" — the logged-in user identity for the current request.
 *
 * Built from JWT claims in {@link JwtAuthenticationFilter}, then stored as the
 * Authentication principal in SecurityContext.
 *
 * Controllers inject it with:
 * {@code @AuthenticationPrincipal CustomerPrincipal principal}
 * and use {@code principal.id()} for "my orders", etc.
 *
 * Why a record (not the JPA {@link CustomerUser} entity)?
 * - Lightweight: no Hibernate session / lazy-loading issues in the filter
 * - Only the fields we need on every request (id, email, role)
 * - Avoids exposing the password hash into the security context
 */
public record CustomerPrincipal(Long id, String email, String role) {
}
