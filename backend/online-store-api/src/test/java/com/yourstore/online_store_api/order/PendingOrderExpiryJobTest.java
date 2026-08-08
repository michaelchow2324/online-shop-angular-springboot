package com.yourstore.online_store_api.order;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PendingOrderExpiryJobTest {

    @Mock
    private OrderService orderService;

    @Test
    void expireStalePendingPayments_usesConfiguredTtlHours() {
        PendingOrderExpiryJob job = new PendingOrderExpiryJob(orderService, 24);
        when(orderService.cancelExpiredPendingPayments(any(LocalDateTime.class))).thenReturn(2);

        LocalDateTime before = LocalDateTime.now().minusHours(24);
        job.expireStalePendingPayments();
        LocalDateTime after = LocalDateTime.now().minusHours(24);

        ArgumentCaptor<LocalDateTime> cutoffCaptor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(orderService).cancelExpiredPendingPayments(cutoffCaptor.capture());
        LocalDateTime cutoff = cutoffCaptor.getValue();
        // Cutoff should be ~now-24h (allow small clock skew during the test)
        org.assertj.core.api.Assertions.assertThat(cutoff).isAfter(before.minusSeconds(2));
        org.assertj.core.api.Assertions.assertThat(cutoff).isBefore(after.plusSeconds(2));
    }
}
