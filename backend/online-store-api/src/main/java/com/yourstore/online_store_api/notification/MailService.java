package com.yourstore.online_store_api.notification;

import java.io.UnsupportedEncodingException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.yourstore.online_store_api.order.ShopOrder;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

/**
 * HTML transactional emails via {@link JavaMailSender} (Mailhog locally, real SMTP in prod).
 * Order listeners and auth call these methods — do not send mail from payment code directly.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private static final String CANADA_POST_TRACK =
            "https://www.canadapost-postescanada.ca/track-reperage/en#/resultList?searchFor=";

    private static final String LOGO_CLASSPATH = "mail/lovely-dearly-logo.jpeg";

    private final JavaMailSender mailSender;
    private final String fromOrders;
    private final String fromNoreply;
    private final String publicWebBaseUrl;
    private final String shopName;

    MailService(
            JavaMailSender mailSender,
            @Value("${app.mail.from-orders:${app.mail.from}}") String fromOrders,
            @Value("${app.mail.from-noreply:${app.mail.from}}") String fromNoreply,
            @Value("${app.public-web-base-url:http://localhost:4200}") String publicWebBaseUrl,
            @Value("${app.mail.shop-name:Lovely Dearly}") String shopName) {
        this.mailSender = mailSender;
        this.fromOrders = fromOrders;
        this.fromNoreply = fromNoreply;
        this.publicWebBaseUrl = trimTrailingSlash(publicWebBaseUrl);
        this.shopName = shopName == null || shopName.isBlank() ? "Lovely Dearly" : shopName.trim();
    }

    /** Paid confirmation: items, total, “we’ll email when shipped”. */
    public void sendOrderPaid(ShopOrder order) {
        String subject = EmailTemplates.paidSubject(order.getOrderNumber());
        String html = EmailTemplates.paidHtml(order, shopName, publicWebBaseUrl, fromOrders);
        String text = EmailTemplates.paidText(order, shopName, publicWebBaseUrl, fromOrders);
        sendHtml(fromOrders, shopName, order.getEmail(), subject, html, text);
    }

    /** Shipped notice: carrier + tracking URL when available. */
    public void sendOrderShipped(ShopOrder order) {
        String subject = EmailTemplates.shippedSubject(order.getOrderNumber());
        String tracking = trackingUrl(order.getCarrier(), order.getTrackingNumber());
        String html = EmailTemplates.shippedHtml(order, shopName, publicWebBaseUrl, fromOrders, tracking);
        String text = EmailTemplates.shippedText(order, shopName, publicWebBaseUrl, fromOrders, tracking);
        sendHtml(fromOrders, shopName, order.getEmail(), subject, html, text);
    }

    /**
     * Guide 06 Step 5 — replace console token log with a clickable verify link.
     * Link shape: {@code {publicWebBaseUrl}/verify-email?token=...}
     */
    public void sendVerifyEmail(String toEmail, String rawToken) {
        String link = publicWebBaseUrl + "/verify-email?token=" + rawToken;
        String subject = EmailTemplates.verifySubject();
        String html = EmailTemplates.verifyHtml(shopName, publicWebBaseUrl, fromNoreply, link);
        String text = EmailTemplates.verifyText(shopName, link);
        sendHtml(fromNoreply, shopName, toEmail, subject, html, text);
    }

    /** Build Canada Post tracking link from tracking number (Chit Chats disabled). */
    public static String trackingUrl(String carrier, String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) {
            return null;
        }
        // Carrier kept for call-site compatibility; all links use Canada Post for now.
        return CANADA_POST_TRACK + trackingNumber.trim();
    }

    private void sendHtml(
            String fromAddress, String fromPersonal, String to, String subject, String html, String text) {
        if (to == null || to.isBlank()) {
            log.warn("Skipping mail '{}': no recipient", subject);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(new InternetAddress(fromAddress, fromPersonal, "UTF-8"));
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(text, html);
            // Inline logo: used as header image and as sender branding asset in clients that show CIDs
            helper.addInline(
                    EmailTemplates.LOGO_CID,
                    new ClassPathResource(LOGO_CLASSPATH),
                    "image/jpeg");
            mailSender.send(message);
            log.info("Sent mail '{}' to {} (from {})", subject, to, fromAddress);
        } catch (MessagingException | UnsupportedEncodingException | MailException ex) {
            log.error("Failed to send mail '{}' to {}: {}", subject, to, ex.getMessage());
            if (ex instanceof MailException mailEx) {
                throw mailEx;
            }
            throw new org.springframework.mail.MailSendException("Failed to send mail: " + subject, ex);
        }
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
