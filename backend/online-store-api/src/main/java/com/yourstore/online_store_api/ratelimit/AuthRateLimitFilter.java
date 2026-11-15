package com.yourstore.online_store_api.ratelimit;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yourstore.common.ApiError;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Rate-limits public auth POSTs by client IP.
 * Returns HTTP 429 with the same {@link ApiError} shape as the rest of the API.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN = "/api/auth/login";
    private static final String REGISTER = "/api/auth/register";
    private static final String RESEND = "/api/auth/resend-verification";

    private final AuthRateLimitProperties properties;
    private final InMemoryRateLimiter limiter;
    private final ObjectMapper objectMapper;
    private final AtomicInteger requestCount = new AtomicInteger();

    public AuthRateLimitFilter(AuthRateLimitProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.limiter = new InMemoryRateLimiter();
    }

    /** Visible for tests. */
    AuthRateLimitFilter(
            AuthRateLimitProperties properties,
            ObjectMapper objectMapper,
            InMemoryRateLimiter limiter) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.limiter = limiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if (!properties.isEnabled()) {
            return true;
        }
        if (!"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = normalizedPath(request);
        return !(LOGIN.equals(path) || REGISTER.equals(path) || RESEND.equals(path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = normalizedPath(request);
        int limit = limitFor(path);
        Duration window = Duration.ofSeconds(Math.max(1, properties.getWindowSeconds()));
        String clientIp = clientIp(request);
        String key = path + ":" + clientIp;

        if (!limiter.tryAcquire(key, limit, window)) {
            long retryAfter = limiter.retryAfterSeconds(key, window);
            writeTooManyRequests(request, response, retryAfter);
            return;
        }

        // Opportunistic cleanup of idle keys (avoids unbounded map growth)
        if (requestCount.incrementAndGet() % 100 == 0) {
            limiter.purgeEmpty();
        }

        filterChain.doFilter(request, response);
    }

    private int limitFor(String path) {
        if (REGISTER.equals(path)) {
            return properties.getRegisterLimit();
        }
        if (RESEND.equals(path)) {
            return properties.getResendLimit();
        }
        return properties.getLoginLimit();
    }

    private void writeTooManyRequests(
            HttpServletRequest request,
            HttpServletResponse response,
            long retryAfterSeconds) throws IOException {

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));

        ApiError body = new ApiError(
                Instant.now(),
                HttpStatus.TOO_MANY_REQUESTS.value(),
                HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                "Too many requests. Please try again shortly.",
                request.getRequestURI(),
                List.of());
        objectMapper.writeValue(response.getOutputStream(), body);
    }

    static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // First hop is the original client when Caddy/Cloudflare appends proxies
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) {
                return first;
            }
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
    }

    private static String normalizedPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String context = request.getContextPath();
        if (context != null && !context.isEmpty() && uri.startsWith(context)) {
            uri = uri.substring(context.length());
        }
        if (uri.length() > 1 && uri.endsWith("/")) {
            uri = uri.substring(0, uri.length() - 1);
        }
        return uri;
    }
}
