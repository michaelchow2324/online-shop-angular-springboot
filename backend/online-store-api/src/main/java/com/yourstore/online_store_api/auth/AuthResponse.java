package com.yourstore.online_store_api.auth;

/**
 * Login / register response: JWT access token plus basic identity.
 */
public record AuthResponse(String accessToken, String email, String role) {
}
