package com.yourstore.online_store_api.order;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Guide 08 — expire abandoned Stripe checkouts.
 * Daily: {@code PENDING_PAYMENT} older than {@code app.orders.pending-payment-ttl-hours}
 * → {@code CANCELLED}. Paid orders are never touched (status predicate in the update).
 */
@Component
public class PendingOrderExpiryJob {

    private static final Logger log = LoggerFactory.getLogger(PendingOrderExpiryJob.class);

    private final OrderService orderService;
    private final long ttlHours;

    PendingOrderExpiryJob(
            OrderService orderService,
            @Value("${app.orders.pending-payment-ttl-hours:24}") long ttlHours) {
        this.orderService = orderService;
        this.ttlHours = ttlHours <= 0 ? 24 : ttlHours;
    }

    /** Every day at 00:00:00 (server local time). */
    @Scheduled(cron = "0 0 0 * * *")
    public void expireStalePendingPayments() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(ttlHours);
        int cancelled = orderService.cancelExpiredPendingPayments(cutoff);
        if (cancelled > 0) {
            log.info(
                    "Cancelled {} PENDING_PAYMENT order(s) older than {} hours (cutoff={})",
                    cancelled,
                    ttlHours,
                    cutoff);
        } else {
            log.debug("No stale PENDING_PAYMENT orders before {}", cutoff);
        }
    }
}
