package com.yourstore.online_store_api.notification;

import java.math.BigDecimal;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.yourstore.online_store_api.order.ShopOrder;
import com.yourstore.online_store_api.order.ShopOrderItem;

/**
 * Plain-text emails via {@link JavaMailSender} (Mailhog locally, real SMTP in prod).
 * Order listeners and auth call these methods — do not send mail from payment code directly.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String CANADA_POST_TRACK =
            "https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=";

    private final JavaMailSender mailSender;
    private final String from;
    private final String publicWebBaseUrl;

    MailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String from,
            @Value("${app.public-web-base-url:http://localhost:4200}") String publicWebBaseUrl) {
        this.mailSender = mailSender;
        this.from = from;
        this.publicWebBaseUrl = trimTrailingSlash(publicWebBaseUrl);
    }

    /** Paid confirmation: items, total, “we’ll email when shipped”. */
    public void sendOrderPaid(ShopOrder order) {
        String subject = "Order " + order.getOrderNumber() + " confirmed";
        String body = buildPaidBody(order);
        send(order.getEmail(), subject, body);
    }

    /** Shipped notice: carrier + tracking URL when available. */
    public void sendOrderShipped(ShopOrder order) {
        String subject = "Order " + order.getOrderNumber() + " shipped";
        String body = buildShippedBody(order);
        send(order.getEmail(), subject, body);
    }

    /**
     * Guide 06 Step 5 — replace console token log with a clickable verify link.
     * Link shape: {@code {publicWebBaseUrl}/verify-email?token=...}
     */
    public void sendVerifyEmail(String toEmail, String rawToken) {
        String link = publicWebBaseUrl + "/verify-email?token=" + rawToken;
        String subject = "Verify your email";
        String body = """
                Welcome!

                Please verify your email by opening this link:
                %s

                If you did not create an account, you can ignore this message.
                """.formatted(link);
        send(toEmail, subject, body);
    }

    /** Build Canada Post tracking link from tracking number (Chit Chats disabled). */
    public static String trackingUrl(String carrier, String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) {
            return null;
        }
        // Carrier kept for call-site compatibility; all links use Canada Post for now.
        return CANADA_POST_TRACK + trackingNumber.trim();
    }

    private void send(String to, String subject, String text) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping mail '{}': no recipient", subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to.trim());
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Sent mail '{}' to {}", subject, to);
        } catch (MailException ex) {
            // Callers (listeners) should also catch; log here so SMTP issues are visible.
            log.error("Failed to send mail '{}' to {}: {}", subject, to, ex.getMessage());
            throw ex;
        }
    }

    private static String buildPaidBody(ShopOrder order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Thanks for your order!\n\n");
        sb.append("Order: ").append(order.getOrderNumber()).append("\n\n");
        sb.append("Items:\n");
        appendItems(sb, order);
        sb.append("\n");
        appendMoneyLine(sb, "Subtotal", order.getSubtotal(), order.getCurrency());
        appendMoneyLine(sb, "Shipping", order.getShippingFee(), order.getCurrency());
        appendMoneyLine(sb, "Tax", order.getTax(), order.getCurrency());
        appendMoneyLine(sb, "Total", order.getTotal(), order.getCurrency());
        sb.append("\nWe'll email you again when your order ships.\n");
        return sb.toString();
    }

    private static String buildShippedBody(ShopOrder order) {
        StringBuilder sb = new StringBuilder();
        sb.append("Good news — your order is on the way.\n\n");
        sb.append("Order: ").append(order.getOrderNumber()).append("\n");
        if (order.getCarrier() != null && !order.getCarrier().isBlank()) {
            sb.append("Carrier: ").append(displayCarrier(order.getCarrier())).append("\n");
        }
        if (order.getTrackingNumber() != null && !order.getTrackingNumber().isBlank()) {
            sb.append("Tracking number: ").append(order.getTrackingNumber().trim()).append("\n");
            String url = trackingUrl(order.getCarrier(), order.getTrackingNumber());
            if (url != null) {
                sb.append("Track package: ").append(url).append("\n");
            }
        }
        sb.append("\nItems:\n");
        appendItems(sb, order);
        return sb.toString();
    }

    private static void appendItems(StringBuilder sb, ShopOrder order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            sb.append("  (no line items)\n");
            return;
        }
        for (ShopOrderItem item : order.getItems()) {
            sb.append("  - ")
                    .append(item.getQuantity())
                    .append(" x ")
                    .append(item.getProductName())
                    .append("  ")
                    .append(formatMoney(item.getLineTotal(), order.getCurrency()))
                    .append("\n");
        }
    }

    private static void appendMoneyLine(StringBuilder sb, String label, BigDecimal amount, String currency) {
        sb.append(label).append(": ").append(formatMoney(amount, currency)).append("\n");
    }

    private static String formatMoney(BigDecimal amount, String currency) {
        String cur = currency == null || currency.isBlank() ? "CAD" : currency;
        if (amount == null) {
            return cur + " 0.00";
        }
        return cur + " " + amount.setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private static String displayCarrier(String carrier) {
        return switch (carrier.trim().toLowerCase(Locale.ROOT)) {
            case "canada_post", "canadapost", "canada-post" -> "Canada Post";
            default -> carrier.trim();
        };
    }

    private static String trimTrailingSlash(String url) {
        if (url == null || url.isBlank()) {
            return "http://localhost:4200";
        }
        String trimmed = url.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }
}
