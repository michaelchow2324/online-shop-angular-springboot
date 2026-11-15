package com.yourstore.online_store_api.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class TotpServiceTest {

    private final TotpService totpService = new TotpService("Lovely Dearly");

    @Test
    void generateSecret_isBase32() {
        String secret = totpService.generateSecret();
        assertThat(secret).isNotBlank();
        assertThat(secret).matches("[A-Z2-7]+");
    }

    @Test
    void verify_acceptsCurrentCode() {
        String secret = totpService.generateSecret();
        long timestep = System.currentTimeMillis() / 1000 / 30;
        String code = totpService.generateCode(secret, timestep);

        assertThat(totpService.verify(secret, code)).isTrue();
    }

    @Test
    void verify_rejectsWrongCode() {
        String secret = totpService.generateSecret();
        assertThat(totpService.verify(secret, "000000")).isFalse();
    }

    @Test
    void otpAuthUrl_containsIssuerAndSecret() {
        String url = totpService.otpAuthUrl("admin@example.com", "ABCSECRET");
        assertThat(url).startsWith("otpauth://totp/");
        assertThat(url).contains("secret=ABCSECRET");
        assertThat(url).contains("admin%40example.com");
    }
}
