package com.yourstore.online_store_api.notification;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;

import com.yourstore.online_store_api.order.ShopOrder;
import com.yourstore.online_store_api.order.ShopOrderRepository;

@ExtendWith(MockitoExtension.class)
class OrderNotificationListenerTest {

    @Mock
    private ShopOrderRepository orderRepository;

    @Mock
    private MailService mailService;

    @InjectMocks
    private OrderNotificationListener listener;

    @Test
    void onPaid_sendsOrderPaidEmail() {
        ShopOrder order = new ShopOrder();
        order.setId(42L);
        when(orderRepository.findByIdWithItems(42L)).thenReturn(Optional.of(order));

        listener.onPaid(new OrderPaidEvent(42L));

        verify(mailService).sendOrderPaid(order);
    }

    @Test
    void onPaid_mailFailure_isSwallowed() {
        ShopOrder order = new ShopOrder();
        order.setId(42L);
        when(orderRepository.findByIdWithItems(42L)).thenReturn(Optional.of(order));
        doThrow(new MailSendException("SMTP down")).when(mailService).sendOrderPaid(order);

        listener.onPaid(new OrderPaidEvent(42L)); // must not throw

        verify(mailService).sendOrderPaid(order);
    }

    @Test
    void onPaid_missingOrder_skipsMail() {
        when(orderRepository.findByIdWithItems(99L)).thenReturn(Optional.empty());

        listener.onPaid(new OrderPaidEvent(99L));

        verify(mailService, never()).sendOrderPaid(any());
    }

    @Test
    void onShipped_sendsOrderShippedEmail() {
        ShopOrder order = new ShopOrder();
        order.setId(7L);
        when(orderRepository.findByIdWithItems(7L)).thenReturn(Optional.of(order));

        listener.onShipped(new OrderShippedEvent(7L));

        verify(mailService).sendOrderShipped(order);
    }
}
