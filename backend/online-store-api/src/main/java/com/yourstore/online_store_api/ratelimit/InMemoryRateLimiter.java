package com.yourstore.online_store_api.ratelimit;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Simple sliding-window rate limiter (single JVM).
 * Suitable for one backend replica; use Redis if you scale out horizontally.
 */
public class InMemoryRateLimiter {

    private final ConcurrentHashMap<String, ConcurrentLinkedDeque<Long>> hits = new ConcurrentHashMap<>();

    /**
     * @return true if the call is allowed and recorded; false if the key is over the limit
     */
    public boolean tryAcquire(String key, int limit, Duration window) {
        if (limit <= 0) {
            return false;
        }
        long now = System.currentTimeMillis();
        long cutoff = now - window.toMillis();
        ConcurrentLinkedDeque<Long> q = hits.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        synchronized (q) {
            evictExpired(q, cutoff);
            if (q.size() >= limit) {
                return false;
            }
            q.addLast(now);
            return true;
        }
    }

    /** Seconds until the oldest hit in the window expires (for {@code Retry-After}). */
    public long retryAfterSeconds(String key, Duration window) {
        ConcurrentLinkedDeque<Long> q = hits.get(key);
        if (q == null || q.isEmpty()) {
            return window.toSeconds();
        }
        synchronized (q) {
            Long oldest = q.peekFirst();
            if (oldest == null) {
                return window.toSeconds();
            }
            long unlockAt = oldest + window.toMillis();
            long seconds = (long) Math.ceil((unlockAt - System.currentTimeMillis()) / 1000.0);
            return Math.max(1, seconds);
        }
    }

    /** Drop empty keys so idle IPs do not retain map entries forever. */
    public void purgeEmpty() {
        for (Map.Entry<String, ConcurrentLinkedDeque<Long>> entry : hits.entrySet()) {
            ConcurrentLinkedDeque<Long> q = entry.getValue();
            synchronized (q) {
                if (q.isEmpty()) {
                    hits.remove(entry.getKey(), q);
                }
            }
        }
    }

    private static void evictExpired(ConcurrentLinkedDeque<Long> q, long cutoff) {
        while (!q.isEmpty()) {
            Long oldest = q.peekFirst();
            if (oldest == null || oldest >= cutoff) {
                break;
            }
            q.pollFirst();
        }
    }
}
