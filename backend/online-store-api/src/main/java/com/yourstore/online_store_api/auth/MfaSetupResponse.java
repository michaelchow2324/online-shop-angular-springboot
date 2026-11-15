package com.yourstore.online_store_api.auth;

/**
 * Returned when an ADMIN starts MFA enrollment (after password + mfa setup token).
 */
public record MfaSetupResponse(String secret, String otpAuthUrl, String email) {
}
