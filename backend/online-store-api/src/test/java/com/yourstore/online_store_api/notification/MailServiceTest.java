package com.yourstore.online_store_api.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.yourstore.online_store_api.order.OrderStatus;
import com.yourstore.online_store_api.order.ShopOrder;
import com.yourstore.online_store_api.order.ShopOrderItem;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private MailService mailService;

    @BeforeEach
    void setUp() {
        mailService = new MailService(mailSender, "orders@localhost");
    }

    @Test
    void sendOrderPaid_usesConfirmedSubjectAndListsItems() {
        ShopOrder order = sampleOrder();

        mailService.sendOrderPaid(order);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage msg = captor.getValue();
        assertThat(msg.getFrom()).isEqualTo("orders@localhost");
        assertThat(msg.getTo()).containsExactly("guest@example.com");
        assertThat(msg.getSubject()).isEqualTo("Order OS-TEST-1 confirmed");
        assertThat(msg.getText())
                .contains("Makeup Bag")
                .contains("CAD 59.95")
                .contains("We'll email you again when your order ships.");
    }

    @Test
    void sendOrderShipped_includesCanadaPostTrackingUrl() {
        ShopOrder order = sampleOrder();
        order.setCarrier("canada_post");
        order.setTrackingNumber("1234567890123456");

        mailService.sendOrderShipped(order);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage msg = captor.getValue();
        assertThat(msg.getSubject()).isEqualTo("Order OS-TEST-1 shipped");
        assertThat(msg.getText())
                .contains("Canada Post")
                .contains("1234567890123456")
                .contains(
                        "https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=1234567890123456");
    }

    @Test
    void trackingUrl_chitChats() {
        assertThat(MailService.trackingUrl("chit_chats", "abc123"))
                .isEqualTo("https://chitchats.com/tracking/abc123");
    }

    private static ShopOrder sampleOrder() {
        ShopOrder order = new ShopOrder();
        order.setOrderNumber("OS-TEST-1");
        order.setEmail("guest@example.com");
        order.setStatus(OrderStatus.PAID);
        order.setCurrency("CAD");
        order.setSubtotal(new BigDecimal("50.00"));
        order.setShippingFee(new BigDecimal("9.95"));
        order.setTax(new BigDecimal("0.00"));
        order.setTotal(new BigDecimal("59.95"));

        ShopOrderItem item = new ShopOrderItem();
        item.setProductName("Makeup Bag");
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("25.00"));
        item.setLineTotal(new BigDecimal("50.00"));
        order.setItems(List.of(item));
        return order;
    }
}
