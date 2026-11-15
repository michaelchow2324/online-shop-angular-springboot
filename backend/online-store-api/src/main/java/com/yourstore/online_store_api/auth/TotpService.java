package com.yourstore.online_store_api.auth;

import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Locale;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base32;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * RFC 6238 TOTP (Google Authenticator compatible): 6 digits, 30s step, HMAC-SHA1.
 */
@Service
public class TotpService {

    private static final int SECRET_BYTES = 20;
    private static final int DIGITS = 6;
    private static final int PERIOD_SECONDS = 30;
    private static final int WINDOW = 1; // accept previous/next step for clock skew

    private final SecureRandom secureRandom = new SecureRandom();
    private final String issuer;

    public TotpService(@Value("${app.mfa.issuer:Lovely Dearly}") String issuer) {
        this.issuer = issuer;
    }

    public String generateSecret() {
        byte[] buffer = new byte[SECRET_BYTES];
        secureRandom.nextBytes(buffer);
        return new Base32().encodeToString(buffer).replace("=", "").toUpperCase(Locale.ROOT);
    }

    public String otpAuthUrl(String email, String secret) {
        String label = urlEncode(issuer) + ":" + urlEncode(email);
        return "otpauth://totp/" + label
                + "?secret=" + secret
                + "&issuer=" + urlEncode(issuer)
                + "&algorithm=SHA1&digits=" + DIGITS
                + "&period=" + PERIOD_SECONDS;
    }

    public boolean verify(String secret, String code) {
        if (secret == null || secret.isBlank() || code == null) {
            return false;
        }
        String normalized = code.replace(" ", "").trim();
        if (!normalized.matches("\\d{6}")) {
            return false;
        }
        long timestep = System.currentTimeMillis() / 1000 / PERIOD_SECONDS;
        for (int i = -WINDOW; i <= WINDOW; i++) {
            String expected = generateCode(secret, timestep + i);
            if (constantTimeEquals(expected, normalized)) {
                return true;
            }
        }
        return false;
    }

    String generateCode(String secret, long timestep) {
        try {
            byte[] key = new Base32().decode(secret.toUpperCase(Locale.ROOT));
            byte[] data = ByteBuffer.allocate(8).putLong(timestep).array();
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);
            int otp = binary % (int) Math.pow(10, DIGITS);
            return String.format(Locale.ROOT, "%0" + DIGITS + "d", otp);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to generate TOTP", ex);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8)
                .replace("+", "%20");
    }
}
