package com.yourstore.online_store_api.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import com.yourstore.online_store_api.order.OrderStatus;
import com.yourstore.online_store_api.order.ShopOrder;
import com.yourstore.online_store_api.order.ShopOrderItem;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    private MailService mailService;

    @BeforeEach
    void setUp() {
        mailService = new MailService(
                mailSender, "orders@localhost", "noreply@localhost", "http://localhost:4200", "Lovely Dearly");
        lenient().when(mailSender.createMimeMessage()).thenAnswer(inv -> new MimeMessage((Session) null));
        lenient().doAnswer(inv -> null).when(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendOrderPaid_usesConfirmedSubjectAndListsItems() throws Exception {
        ShopOrder order = sampleOrder();

        mailService.sendOrderPaid(order);

        MimeMessage msg = captureSent();
        assertThat(msg.getFrom()[0].toString()).contains("Lovely Dearly");
        assertThat(msg.getFrom()[0].toString()).contains("orders@localhost");
        assertThat(msg.getAllRecipients()[0].toString()).contains("guest@example.com");
        assertThat(msg.getSubject()).isEqualTo("Order #OS-TEST-1 confirmed");
        String raw = rawMime(msg);
        assertThat(raw)
                .contains("Makeup Bag")
                .contains("$59.95")
                .contains("We're getting your order ready to be shipped")
                .contains("cid:logo");
    }

    @Test
    void sendOrderShipped_includesCanadaPostTrackingUrl() throws Exception {
        ShopOrder order = sampleOrder();
        order.setCarrier("canada_post");
        order.setTrackingNumber("1234567890123456");

        mailService.sendOrderShipped(order);

        MimeMessage msg = captureSent();
        assertThat(msg.getSubject()).isEqualTo("A shipment from order #OS-TEST-1 is on the way");
        String raw = rawMime(msg);
        assertThat(raw)
                .contains("Canada Post")
                .contains("1234567890123456")
                .contains(
                        "https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=1234567890123456")
                .contains("Your order is on the way")
                .contains("cid:logo");
    }

    @Test
    void sendVerifyEmail_containsFrontendLinkWithToken() throws Exception {
        mailService.sendVerifyEmail("new@example.com", "abc123token");

        MimeMessage msg = captureSent();
        assertThat(msg.getFrom()[0].toString()).contains("noreply@localhost");
        assertThat(msg.getSubject()).isEqualTo("Confirm your email address.");
        assertThat(msg.getAllRecipients()[0].toString()).contains("new@example.com");
        String raw = rawMime(msg);
        assertThat(raw)
                .contains("http://localhost:4200/verify-email?token=abc123token")
                .contains("Confirm your email address.")
                .contains("cid:logo");
    }

    @Test
    void trackingUrl_usesCanadaPost() {
        assertThat(MailService.trackingUrl("canada_post", "abc123"))
                .isEqualTo(
                        "https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=abc123");
    }

    private MimeMessage captureSent() {
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender).send(captor.capture());
        return captor.getValue();
    }

    private static String rawMime(MimeMessage msg) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        msg.writeTo(out);
        return out.toString(StandardCharsets.UTF_8);
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
        order.setShippingName("Test Guest");
        order.setShippingLine1("12 Example St");
        order.setShippingCity("Toronto");
        order.setShippingProvince("ON");
        order.setShippingPostal("M5V 2T6");
        order.setShippingCountry("CA");
        order.setShippingMethod("regular");

        ShopOrderItem item = new ShopOrderItem();
        item.setProductName("Makeup Bag");
        item.setQuantity(2);
        item.setUnitPrice(new BigDecimal("25.00"));
        item.setLineTotal(new BigDecimal("50.00"));
        order.setItems(List.of(item));
        return order;
    }
}
