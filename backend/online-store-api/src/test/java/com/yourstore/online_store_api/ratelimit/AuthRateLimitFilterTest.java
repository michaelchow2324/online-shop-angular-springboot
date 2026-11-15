package com.yourstore.online_store_api.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class AuthRateLimitFilterTest {

    @Mock
    private InMemoryRateLimiter limiter;

    private AuthRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        AuthRateLimitProperties properties = new AuthRateLimitProperties();
        properties.setEnabled(true);
        properties.setWindowSeconds(60);
        properties.setLoginLimit(10);
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        filter = new AuthRateLimitFilter(properties, mapper, limiter);
    }

    @Test
    void loginAllowed_continuesChain() throws Exception {
        when(limiter.tryAcquire(eq("/api/auth/login:203.0.113.10"), eq(10), eq(Duration.ofSeconds(60))))
                .thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("203.0.113.10");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isNotNull();
        assertThat(response.getStatus()).isNotEqualTo(429);
    }

    @Test
    void loginBlocked_returns429WithRetryAfter() throws Exception {
        when(limiter.tryAcquire(eq("/api/auth/login:203.0.113.10"), eq(10), eq(Duration.ofSeconds(60))))
                .thenReturn(false);
        when(limiter.retryAfterSeconds(eq("/api/auth/login:203.0.113.10"), eq(Duration.ofSeconds(60))))
                .thenReturn(42L);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("203.0.113.10");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isEqualTo("42");
        assertThat(response.getContentAsString()).contains("Too many requests");
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void usesXForwardedForFirstHop() throws Exception {
        when(limiter.tryAcquire(eq("/api/auth/login:198.51.100.7"), eq(10), eq(Duration.ofSeconds(60))))
                .thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.addHeader("X-Forwarded-For", "198.51.100.7, 10.0.0.1");
        request.setRemoteAddr("10.0.0.1");

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        verify(limiter).tryAcquire(eq("/api/auth/login:198.51.100.7"), eq(10), eq(Duration.ofSeconds(60)));
    }

    @Test
    void clientIp_prefersForwardedFor() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "198.51.100.7, 10.0.0.1");
        request.setRemoteAddr("10.0.0.1");
        assertThat(AuthRateLimitFilter.clientIp(request)).isEqualTo("198.51.100.7");
    }
}
