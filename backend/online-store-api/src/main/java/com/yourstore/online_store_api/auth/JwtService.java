package com.yourstore.online_store_api.auth;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Creates and validates JWTs (JSON Web Tokens) with jjwt.
 *
 * A JWT is a signed string the client sends as {@code Authorization: Bearer <token>}.
 * It is NOT stored in the DB — the signature proves it was issued by us (using app.jwt.secret).
 *
 * Typical claims we put in the token:
 * - {@code sub}  = user id (who is logged in)
 * - {@code email}, {@code role} = handy for SecurityContext without a DB hit every request
 * - {@code iat} / {@code exp} = issued-at / expiry
 *
 * Flow: login → {@link #createToken} → client stores token → filter calls {@link #parsePrincipal}.
 */
@Service
public class JwtService {

    public static final String PURPOSE_ACCESS = "access";
    public static final String PURPOSE_MFA_CHALLENGE = "mfa_challenge";
    public static final String PURPOSE_MFA_SETUP = "mfa_setup";

    /** HMAC key derived from app.jwt.secret (must be long enough for HS256, ≥ 32 bytes). */
    private final SecretKey key;

    /** How long a token stays valid after login (default 24h from properties). */
    private final long expirationMs;

    /** Short-lived token after password for MFA challenge / setup (default 5 minutes). */
    private final long mfaExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.jwt.mfa-expiration-ms:300000}") long mfaExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.mfaExpirationMs = mfaExpirationMs;
    }

    /** Full session JWT (called after password for USERs, or after MFA for ADMINs). */
    public String createToken(CustomerUser user) {
        return buildToken(user, PURPOSE_ACCESS, expirationMs);
    }

    /** Short-lived token proving password was OK; not accepted as Bearer for /api/admin. */
    public String createMfaToken(CustomerUser user, String purpose) {
        if (!PURPOSE_MFA_CHALLENGE.equals(purpose) && !PURPOSE_MFA_SETUP.equals(purpose)) {
            throw new IllegalArgumentException("Invalid MFA token purpose");
        }
        return buildToken(user, purpose, mfaExpirationMs);
    }

    /** Read claims and turn them into our app principal (used by the JWT filter). */
    public CustomerPrincipal parsePrincipal(String token) {
        Claims claims = requireAccessClaims(token);
        return toPrincipal(claims);
    }

    /**
     * Validate an MFA step token and return the user principal.
     * @throws IllegalArgumentException if signature/expiry/purpose is wrong
     */
    public CustomerPrincipal parseMfaToken(String token, String expectedPurpose) {
        try {
            Claims claims = parseClaims(token);
            String purpose = claims.get("purpose", String.class);
            if (!expectedPurpose.equals(purpose)) {
                throw new IllegalArgumentException("Invalid or expired MFA session. Sign in again.");
            }
            return toPrincipal(claims);
        } catch (JwtException ex) {
            throw new IllegalArgumentException("Invalid or expired MFA session. Sign in again.");
        }
    }

    /**
     * True if signature is valid, not expired, and this is a full access token
     * (MFA challenge/setup tokens must not open admin APIs).
     */
    public boolean isValid(String token) {
        try {
            requireAccessClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private String buildToken(CustomerUser user, String purpose, long ttlMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + ttlMs);
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .claim("purpose", purpose)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    private Claims requireAccessClaims(String token) {
        Claims claims = parseClaims(token);
        String purpose = claims.get("purpose", String.class);
        // Legacy tokens without purpose are treated as access tokens
        if (purpose != null && !purpose.isBlank() && !PURPOSE_ACCESS.equals(purpose)) {
            throw new JwtException("Not an access token");
        }
        return claims;
    }

    private static CustomerPrincipal toPrincipal(Claims claims) {
        Long id = Long.valueOf(claims.getSubject());
        String email = claims.get("email", String.class);
        String role = claims.get("role", String.class);
        return new CustomerPrincipal(id, email, role);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
