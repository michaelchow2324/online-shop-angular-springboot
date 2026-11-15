package com.yourstore.online_store_api.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;

import org.junit.jupiter.api.Test;

class InMemoryRateLimiterTest {

    @Test
    void allowsUpToLimitThenBlocks() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        Duration window = Duration.ofMinutes(1);

        assertThat(limiter.tryAcquire("login:1.1.1.1", 3, window)).isTrue();
        assertThat(limiter.tryAcquire("login:1.1.1.1", 3, window)).isTrue();
        assertThat(limiter.tryAcquire("login:1.1.1.1", 3, window)).isTrue();
        assertThat(limiter.tryAcquire("login:1.1.1.1", 3, window)).isFalse();
    }

    @Test
    void differentKeysAreIndependent() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        Duration window = Duration.ofMinutes(1);

        assertThat(limiter.tryAcquire("login:1.1.1.1", 1, window)).isTrue();
        assertThat(limiter.tryAcquire("login:1.1.1.1", 1, window)).isFalse();
        assertThat(limiter.tryAcquire("login:2.2.2.2", 1, window)).isTrue();
    }

    @Test
    void retryAfterSecondsIsAtLeastOneWhenBlocked() {
        InMemoryRateLimiter limiter = new InMemoryRateLimiter();
        Duration window = Duration.ofSeconds(60);

        limiter.tryAcquire("k", 1, window);
        assertThat(limiter.tryAcquire("k", 1, window)).isFalse();
        assertThat(limiter.retryAfterSeconds("k", window)).isBetween(1L, 60L);
    }
}
