package com.yourstore.online_store_api.auth;

/**
 * Login response.
 * <ul>
 *   <li>Normal USER / completed MFA → {@code accessToken} set</li>
 *   <li>ADMIN MFA already on → {@code mfaRequired} + short-lived {@code mfaToken}</li>
 *   <li>ADMIN MFA not set up → {@code mfaSetupRequired} + short-lived {@code mfaToken}</li>
 * </ul>
 */
public record AuthResponse(
        String accessToken,
        String email,
        String role,
        boolean mfaRequired,
        boolean mfaSetupRequired,
        String mfaToken
) {
    public static AuthResponse fullAccess(String accessToken, String email, String role) {
        return new AuthResponse(accessToken, email, role, false, false, null);
    }

    public static AuthResponse mfaChallenge(String email, String role, String mfaToken) {
        return new AuthResponse(null, email, role, true, false, mfaToken);
    }

    public static AuthResponse mfaSetup(String email, String role, String mfaToken) {
        return new AuthResponse(null, email, role, false, true, mfaToken);
    }
}
