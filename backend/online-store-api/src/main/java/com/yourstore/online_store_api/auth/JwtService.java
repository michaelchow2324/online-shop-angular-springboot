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

    /** HMAC key derived from app.jwt.secret (must be long enough for HS256, ≥ 32 bytes). */
    private final SecretKey key;

    /** How long a token stays valid after login (default 24h from properties). */
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        // Keys.hmacShaKeyFor turns the secret string into a crypto key for signing/verifying
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // Jwts.builder() builds a JWT from the claims you set (and then signs them with your secret): header.payload.signature
    // Same user + same iat/exp + same claims → same token string. In practice tokens differ because issuedAt / expiration change each login.
    
    /** Build a signed JWT for this user (called from AuthService.login). */
    public String createToken(CustomerUser user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(String.valueOf(user.getId())) // standard "sub" claim
                .claim("email", user.getEmail())       // custom claims
                .claim("role", user.getRole())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)                         // HMAC-SHA signature
                .compact();                            // header.payload.signature string
    }

    /** Read claims and turn them into our app principal (used by the JWT filter). */
    public CustomerPrincipal parsePrincipal(String token) {
        Claims claims = parseClaims(token);
        Long id = Long.valueOf(claims.getSubject());
        String email = claims.get("email", String.class);
        String role = claims.get("role", String.class);
        return new CustomerPrincipal(id, email, role);
    }

    /**
     * True if signature is valid and token is not expired / malformed.
     * Invalid tokens are ignored by the filter (request stays anonymous → 401 on protected routes).
     */
    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    /** Verify signature + expiry, then return the payload claims. Throws if bad. */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
