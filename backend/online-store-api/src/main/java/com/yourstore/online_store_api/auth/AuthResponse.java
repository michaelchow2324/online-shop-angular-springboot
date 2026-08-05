package com.yourstore.online_store_api.auth;

/**
 * Login response. {@code accessToken} is filled once JWT (guide step 3) is wired.
 */
public record AuthResponse(String accessToken, String email, String role) {
}
