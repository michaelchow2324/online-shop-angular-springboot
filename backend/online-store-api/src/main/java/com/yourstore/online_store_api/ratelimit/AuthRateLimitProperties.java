package com.yourstore.online_store_api.ratelimit;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.rate-limit.auth")
public class AuthRateLimitProperties {

    /** Master switch — disable only for local load tests if needed. */
    private boolean enabled = true;

    /** Sliding window length in seconds. */
    private int windowSeconds = 60;

    /** Max POSTs to /api/auth/login per IP per window. */
    private int loginLimit = 10;

    /** Max POSTs to /api/auth/register per IP per window. */
    private int registerLimit = 5;

    /** Max POSTs to /api/auth/resend-verification per IP per window. */
    private int resendLimit = 5;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getWindowSeconds() {
        return windowSeconds;
    }

    public void setWindowSeconds(int windowSeconds) {
        this.windowSeconds = windowSeconds;
    }

    public int getLoginLimit() {
        return loginLimit;
    }

    public void setLoginLimit(int loginLimit) {
        this.loginLimit = loginLimit;
    }

    public int getRegisterLimit() {
        return registerLimit;
    }

    public void setRegisterLimit(int registerLimit) {
        this.registerLimit = registerLimit;
    }

    public int getResendLimit() {
        return resendLimit;
    }

    public void setResendLimit(int resendLimit) {
        this.resendLimit = resendLimit;
    }
}
