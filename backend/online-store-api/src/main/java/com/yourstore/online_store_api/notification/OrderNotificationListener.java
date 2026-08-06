package com.yourstore.online_store_api.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.yourstore.online_store_api.order.ShopOrderRepository;

/**
 * Sends order emails after the payment/ship transaction has committed.
 *
 * <p>{@code AFTER_COMMIT} keeps SMTP failures from rolling back {@code PAID}/{@code SHIPPED}.
 * Errors are logged and swallowed so Stripe webhook / admin ship still succeed.
 * 
 * When Spring register OrderNotificationListener as a bean, it will register onPaid/onShipped as event listeners.
 * After that, any published event() will be handled by the listener.
 */
@Component
public class OrderNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(OrderNotificationListener.class);

    private final ShopOrderRepository orderRepository;
    private final MailService mailService;

    OrderNotificationListener(ShopOrderRepository orderRepository, MailService mailService) {
        this.orderRepository = orderRepository;
        this.mailService = mailService;
    }
    
    // when an OrderPaidEvent is published, this method will be called.
    // AFTER_COMMIT: After the transaction has committed, the method will be called.
    // readOnly = true: The method will not modify the database. (increases performance)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(readOnly = true)
    public void onPaid(OrderPaidEvent event) {
        try {
            orderRepository.findByIdWithItems(event.orderId()).ifPresentOrElse(
                    mailService::sendOrderPaid,
                    () -> log.warn("OrderPaidEvent: order {} not found — skip paid email", event.orderId()));
        } catch (Exception ex) {
            log.error("Failed paid email for order {}: {}", event.orderId(), ex.getMessage(), ex);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(readOnly = true)
    public void onShipped(OrderShippedEvent event) {
        try {
            orderRepository.findByIdWithItems(event.orderId()).ifPresentOrElse(
                    mailService::sendOrderShipped,
                    () -> log.warn("OrderShippedEvent: order {} not found — skip shipped email", event.orderId()));
        } catch (Exception ex) {
            log.error("Failed shipped email for order {}: {}", event.orderId(), ex.getMessage(), ex);
        }
    }
}
