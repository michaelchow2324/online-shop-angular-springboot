package com.yourstore.online_store_api.notification;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

import com.yourstore.online_store_api.order.ShopOrder;
import com.yourstore.online_store_api.order.ShopOrderItem;

/**
 * HTML + plain-text bodies for transactional mail (Shopify / Lightspeed-style layout).
 * Logo is referenced via CID {@code logo} (inline attachment from MailService).
 */
final class EmailTemplates {

    static final String LOGO_CID = "logo";
    private static final String ACCENT = "#c8869e";
    private static final String FONT =
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif";

    private EmailTemplates() {}

    static String verifySubject() {
        return "Confirm your email address.";
    }

    static String paidSubject(String orderNumber) {
        return "Order #" + orderNumber + " confirmed";
    }

    static String shippedSubject(String orderNumber) {
        return "A shipment from order #" + orderNumber + " is on the way";
    }

    static String refundedSubject(String orderNumber) {
        return "Refund for order #" + orderNumber;
    }

    static String verifyHtml(String shopName, String shopUrl, String contactEmail, String verifyLink) {
        String safeShop = esc(shopName);
        String safeUrl = esc(shopUrl);
        String safeEmail = esc(contactEmail);
        String safeLink = esc(verifyLink);
        return """
                <!DOCTYPE html>
                <html><head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                <meta name="viewport" content="width=device-width"/>
                <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#F9F9F9;font-family:%s;color:#ABB3B3;font-size:13px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%%" style="padding:2em 0 0;max-width:600px;margin:0 auto;">
                  <tr><td>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="border:1px #DEE1E2 solid;background:#FFFFFF;max-width:600px;">
                      <tr>
                        <td style="text-align:center;vertical-align:top;font-size:0;padding:24px;">
                          <div style="width:48%%;display:inline-block;vertical-align:middle;text-align:left;">
                            <a href="%s"><img src="cid:%s" alt="%s" width="160" style="max-width:160px;height:auto;border:0;"/></a>
                          </div>
                          <div style="width:48%%;display:inline-block;vertical-align:top;text-align:left;font-size:13px;color:#333;line-height:1.5;">
                            <b style="color:%s;">%s</b><br/>
                            <a href="mailto:%s" style="color:#333;text-decoration:none;">%s</a><br/>
                            <a href="%s" style="color:#333;text-decoration:none;">%s</a><br/>
                            <a href="%s/account" style="color:#000;text-decoration:none;">My account</a>
                            &nbsp;|&nbsp;
                            <a href="mailto:%s" style="color:#000;text-decoration:none;">Contact</a>
                          </div>
                        </td>
                      </tr>
                      <tr><td height="1" style="height:1px;background-color:#E1E4E5;"></td></tr>
                      <tr>
                        <td style="padding:24px;">
                          <p style="margin:0 0 16px;font-size:16px;color:%s;font-weight:600;">Confirm your email address.</p>
                          <div style="font-size:14px;color:#333;line-height:1.6;">
                            <p>Please confirm your email address to finish setting up your %s account.</p>
                            <p>To confirm your email address, click the button below.</p>
                            <p style="margin:24px 0;">
                              <a href="%s" style="display:inline-block;background:%s;color:#fff;text-decoration:none;padding:14px 22px;border-radius:4px;font-size:16px;">Confirm email</a>
                            </p>
                            <p style="font-size:13px;color:#777;">If the button does not work, copy and paste this link into your browser:<br/>
                            <a href="%s" style="color:%s;word-break:break-all;">%s</a></p>
                            <p>Sincerely<br/>%s</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width:600px;">
                      <tr><td style="padding:16px 8px;text-align:center;font-size:12px;color:#999;line-height:1.6;">
                        Copyright %d | <a href="%s" style="color:#999;">%s</a>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
                </body></html>
                """.formatted(
                verifySubject(),
                FONT,
                safeUrl,
                LOGO_CID,
                safeShop,
                ACCENT,
                safeShop,
                safeEmail,
                safeEmail,
                safeUrl,
                displayHost(shopUrl),
                safeUrl,
                safeEmail,
                ACCENT,
                safeShop,
                safeLink,
                ACCENT,
                safeLink,
                ACCENT,
                safeLink,
                safeShop,
                java.time.Year.now().getValue(),
                safeUrl,
                safeShop);
    }

    static String verifyText(String shopName, String verifyLink) {
        return """
                Confirm your email address.

                Please confirm your email address to finish setting up your %s account.

                To confirm your email address, open this link:
                %s

                If you did not create an account, you can ignore this message.

                Sincerely
                %s
                """.formatted(shopName, verifyLink, shopName);
    }

    static String paidHtml(ShopOrder order, String shopName, String shopUrl, String contactEmail) {
        String orderNumber = esc(order.getOrderNumber());
        String orderUrl = esc(shopUrl + "/account/order/details/" + order.getOrderNumber());
        String safeShop = esc(shopName);
        String safeUrl = esc(shopUrl);
        String safeEmail = esc(contactEmail);

        StringBuilder items = new StringBuilder();
        if (order.getItems() == null || order.getItems().isEmpty()) {
            items.append("<tr><td style=\"padding:8px 0;color:#777;\">(no line items)</td></tr>");
        } else {
            for (ShopOrderItem item : order.getItems()) {
                items.append("""
                        <tr>
                          <td style="padding:8px 0;font-size:16px;font-weight:600;color:#555;line-height:1.4;">
                            %s&nbsp;&times;&nbsp;%d
                          </td>
                          <td style="padding:8px 0;font-size:16px;font-weight:600;color:#555;text-align:right;white-space:nowrap;">
                            %s
                          </td>
                        </tr>
                        """.formatted(
                        esc(item.getProductName()),
                        item.getQuantity() == null ? 0 : item.getQuantity(),
                        esc(formatMoney(item.getLineTotal(), order.getCurrency()))));
            }
        }

        String address = formatAddressHtml(order);

        return shopifyShell(
                "Thank you for your purchase!",
                """
                <h2 style="font-weight:normal;font-size:24px;margin:0 0 10px;color:#333;">Thank you for your purchase!</h2>
                <p style="color:#777;line-height:150%%;font-size:16px;margin:0;">
                  We're getting your order ready to be shipped. We will notify you when it has been sent.
                  When you receive your order, please make sure to record an unedited unboxing video as they are
                  required to request an exchange, report missing items, or request a full/partial refund.
                </p>
                %s
                """.formatted(actionButtons(orderUrl, safeUrl)),
                """
                <h3 style="font-weight:normal;font-size:20px;margin:0 0 25px;color:#333;">Order summary</h3>
                <table style="width:100%%;border-spacing:0;border-collapse:collapse;">
                  %s
                </table>
                <table style="width:100%%;border-spacing:0;border-collapse:collapse;margin-top:15px;border-top:1px solid #e5e5e5;">
                  <tr>
                    <td style="width:40%%;"></td>
                    <td>
                      <table style="width:100%%;border-spacing:0;border-collapse:collapse;margin-top:20px;">
                        %s
                        %s
                        %s
                      </table>
                      <table style="width:100%%;border-spacing:0;border-collapse:collapse;margin-top:20px;border-top:2px solid #e5e5e5;">
                        %s
                      </table>
                    </td>
                  </tr>
                </table>
                """.formatted(
                        items,
                        subtotalLine("Subtotal", formatMoney(order.getSubtotal(), order.getCurrency())),
                        subtotalLine("Shipping", formatMoney(order.getShippingFee(), order.getCurrency())),
                        subtotalLine(taxLabel(order), formatMoney(order.getTax(), order.getCurrency())),
                        subtotalLine("Total", formatMoney(order.getTotal(), order.getCurrency()) + " "
                                + (order.getCurrency() == null ? "CAD" : order.getCurrency()))),
                """
                <h3 style="font-weight:normal;font-size:20px;margin:0 0 25px;color:#333;">Customer information</h3>
                <table style="width:100%%;border-spacing:0;border-collapse:collapse;">
                  <tr>
                    <td style="width:50%%;padding-bottom:24px;vertical-align:top;">
                      <h4 style="font-weight:500;font-size:16px;color:#555;margin:0 0 5px;">Shipping address</h4>
                      <p style="color:#777;line-height:150%%;font-size:16px;margin:0;">%s</p>
                    </td>
                    <td style="width:50%%;padding-bottom:24px;vertical-align:top;">
                      <h4 style="font-weight:500;font-size:16px;color:#555;margin:0 0 5px;">Billing address</h4>
                      <p style="color:#777;line-height:150%%;font-size:16px;margin:0;">%s</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;vertical-align:top;" colspan="2">
                      <h4 style="font-weight:500;font-size:16px;color:#555;margin:0 0 5px;">Shipping method</h4>
                      <p style="color:#777;line-height:150%%;font-size:16px;margin:0;">%s</p>
                    </td>
                  </tr>
                </table>
                """.formatted(address, address, esc(displayShippingMethod(order))),
                orderNumber,
                safeShop,
                safeUrl,
                safeEmail);
    }

    static String paidText(ShopOrder order, String shopName, String shopUrl, String contactEmail) {
        StringBuilder sb = new StringBuilder();
        sb.append("Thank you for your purchase!\n\n");
        sb.append(shopName).append("\n").append(shopUrl).append("\n\n");
        sb.append("Order #").append(order.getOrderNumber()).append("\n\n");
        sb.append("We're getting your order ready to be shipped. We will notify you when it has been sent.\n");
        sb.append("When you receive your order, please make sure to record an unedited unboxing video as they are ")
                .append("required to request an exchange, report missing items, or request a full/partial refund.\n\n");
        sb.append("View your order: ").append(shopUrl).append("/account/order/details/").append(order.getOrderNumber()).append("\n");
        sb.append("Visit our store: ").append(shopUrl).append("\n\n");
        sb.append("Order summary\n");
        appendItemsText(sb, order);
        sb.append("\nSubtotal: ").append(formatMoney(order.getSubtotal(), order.getCurrency())).append('\n');
        sb.append("Shipping: ").append(formatMoney(order.getShippingFee(), order.getCurrency())).append('\n');
        sb.append(taxLabel(order)).append(": ").append(formatMoney(order.getTax(), order.getCurrency())).append('\n');
        sb.append("Total: ").append(formatMoney(order.getTotal(), order.getCurrency())).append(' ')
                .append(order.getCurrency() == null ? "CAD" : order.getCurrency()).append("\n\n");
        sb.append("Shipping address\n").append(formatAddressText(order)).append("\n\n");
        sb.append("Shipping method\n").append(displayShippingMethod(order)).append("\n\n");
        sb.append("If you have any questions, reply to this email or contact us at ").append(contactEmail).append('\n');
        return sb.toString();
    }

    static String shippedHtml(ShopOrder order, String shopName, String shopUrl, String contactEmail, String trackingUrl) {
        String orderNumber = esc(order.getOrderNumber());
        String orderUrl = esc(shopUrl + "/account/order/details/" + order.getOrderNumber());
        String safeShop = esc(shopName);
        String safeUrl = esc(shopUrl);
        String safeEmail = esc(contactEmail);

        StringBuilder items = new StringBuilder();
        if (order.getItems() == null || order.getItems().isEmpty()) {
            items.append("<tr><td style=\"padding:8px 0;color:#777;\">(no line items)</td></tr>");
        } else {
            boolean first = true;
            for (ShopOrderItem item : order.getItems()) {
                String border = first ? "none" : "solid";
                first = false;
                items.append("""
                        <tr style="border-top:1px %s #e5e5e5;">
                          <td style="padding:15px 0;font-size:16px;font-weight:600;color:#555;line-height:1.4;">
                            %s&nbsp;&times;&nbsp;%d
                          </td>
                        </tr>
                        """.formatted(
                        border,
                        esc(item.getProductName()),
                        item.getQuantity() == null ? 0 : item.getQuantity()));
            }
        }

        String trackingBlock = "";
        if (order.getTrackingNumber() != null && !order.getTrackingNumber().isBlank()) {
            String tn = esc(order.getTrackingNumber().trim());
            String carrier = esc(displayCarrier(order.getCarrier()));
            String href = trackingUrl == null ? "#" : esc(trackingUrl);
            trackingBlock = """
                    <p style="color:#999;line-height:150%%;font-size:14px;margin:16px 0 0;">
                      %s tracking number:
                      <a href="%s" style="font-size:14px;text-decoration:none;color:%s;">%s</a>
                    </p>
                    """.formatted(carrier, href, ACCENT, tn);
        }

        return shopifyShell(
                "Your order is on the way",
                """
                <h2 style="font-weight:normal;font-size:24px;margin:0 0 10px;color:#333;">Your order is on the way</h2>
                <p style="color:#777;line-height:150%%;font-size:16px;margin:0;">
                  Your order is on the way. Track your shipment to see the delivery status.
                  When you receive your order, please make sure to record an unedited unboxing video as they are
                  required to request an exchange, report missing items, or request a full/partial refund.
                </p>
                %s
                %s
                """.formatted(actionButtons(orderUrl, safeUrl), trackingBlock),
                """
                <h3 style="font-weight:normal;font-size:20px;margin:0 0 25px;color:#333;">Items in this shipment</h3>
                <table style="width:100%%;border-spacing:0;border-collapse:collapse;">
                  %s
                </table>
                """.formatted(items),
                "",
                orderNumber,
                safeShop,
                safeUrl,
                safeEmail);
    }

    static String shippedText(ShopOrder order, String shopName, String shopUrl, String contactEmail, String trackingUrl) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your order is on the way\n\n");
        sb.append(shopName).append("\n").append(shopUrl).append("\n\n");
        sb.append("Order #").append(order.getOrderNumber()).append("\n\n");
        sb.append("Your order is on the way. Track your shipment to see the delivery status.\n");
        sb.append("When you receive your order, please make sure to record an unedited unboxing video as they are ")
                .append("required to request an exchange, report missing items, or request a full/partial refund.\n\n");
        sb.append("View your order: ").append(shopUrl).append("/account/order/details/").append(order.getOrderNumber()).append("\n");
        sb.append("Visit our store: ").append(shopUrl).append("\n\n");
        if (order.getTrackingNumber() != null && !order.getTrackingNumber().isBlank()) {
            sb.append(displayCarrier(order.getCarrier())).append(" tracking number: ").append(order.getTrackingNumber().trim());
            if (trackingUrl != null) {
                sb.append("\n").append(trackingUrl);
            }
            sb.append("\n\n");
        }
        sb.append("Items in this shipment\n");
        appendItemsText(sb, order);
        sb.append("\nIf you have any questions, reply to this email or contact us at ").append(contactEmail).append('\n');
        return sb.toString();
    }

    static String refundedHtml(ShopOrder order, String shopName, String shopUrl, String contactEmail) {
        String orderNumber = esc(order.getOrderNumber());
        String orderUrl = esc(shopUrl + "/account/order/details/" + order.getOrderNumber());
        String safeShop = esc(shopName);
        String safeUrl = esc(shopUrl);
        String safeEmail = esc(contactEmail);
        String total = esc(formatMoney(order.getTotal(), order.getCurrency()) + " "
                + (order.getCurrency() == null ? "CAD" : order.getCurrency()));

        return shopifyShell(
                "Your order has been refunded",
                """
                <h2 style="font-weight:normal;font-size:24px;margin:0 0 10px;color:#333;">Your order has been refunded</h2>
                <p style="color:#777;line-height:150%%;font-size:16px;margin:0;">
                  We've issued a full refund of <strong style="color:#555;">%s</strong> for order #%s.
                  Depending on your bank or card issuer, it may take a few business days to appear on your statement.
                </p>
                %s
                """.formatted(total, orderNumber, actionButtons(orderUrl, safeUrl)),
                """
                <h3 style="font-weight:normal;font-size:20px;margin:0 0 10px;color:#333;">Refund amount</h3>
                <p style="color:#555;font-size:16px;margin:0;">%s</p>
                """.formatted(total),
                "",
                orderNumber,
                safeShop,
                safeUrl,
                safeEmail);
    }

    static String refundedText(ShopOrder order, String shopName, String shopUrl, String contactEmail) {
        StringBuilder sb = new StringBuilder();
        sb.append("Your order has been refunded\n\n");
        sb.append(shopName).append("\n").append(shopUrl).append("\n\n");
        sb.append("Order #").append(order.getOrderNumber()).append("\n\n");
        sb.append("We've issued a full refund of ")
                .append(formatMoney(order.getTotal(), order.getCurrency()))
                .append(' ')
                .append(order.getCurrency() == null ? "CAD" : order.getCurrency())
                .append(".\n");
        sb.append("Depending on your bank or card issuer, it may take a few business days to appear on your statement.\n\n");
        sb.append("View your order: ").append(shopUrl).append("/account/order/details/").append(order.getOrderNumber()).append("\n");
        sb.append("Visit our store: ").append(shopUrl).append("\n\n");
        sb.append("If you have any questions, reply to this email or contact us at ").append(contactEmail).append('\n');
        return sb.toString();
    }

    private static String shopifyShell(
            String title,
            String contentHtml,
            String section1Html,
            String section2Html,
            String orderNumber,
            String safeShop,
            String safeUrl,
            String safeEmail) {
        String section2 = (section2Html == null || section2Html.isBlank())
                ? ""
                : """
                <table class="row section" style="width:100%%;border-spacing:0;border-collapse:collapse;">
                  <tr><td style="padding:40px 0;font-family:%s;">
                    <center>
                      <table style="width:560px;text-align:left;border-spacing:0;border-collapse:collapse;margin:0 auto;">
                        <tr><td>%s</td></tr>
                      </table>
                    </center>
                  </td></tr>
                </table>
                """.formatted(FONT, section2Html);

        return """
                <!DOCTYPE html>
                <html><head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                <meta name="viewport" content="width=device-width"/>
                <title>%s</title>
                <style>
                @media (max-width:600px) {
                  .container { width:94%% !important; }
                  .main-action-cell { float:none !important; margin-right:0 !important; }
                  .button { width:100%%; }
                }
                </style>
                </head>
                <body style="margin:0;">
                <table style="height:100%% !important;width:100%% !important;border-spacing:0;border-collapse:collapse;">
                  <tr><td style="font-family:%s;">
                    <table style="width:100%%;border-spacing:0;border-collapse:collapse;margin:40px 0 20px;">
                      <tr><td>
                        <center>
                          <table class="container" style="width:560px;text-align:left;border-spacing:0;border-collapse:collapse;margin:0 auto;">
                            <tr><td>
                              <table style="width:100%%;border-spacing:0;border-collapse:collapse;">
                                <tr>
                                  <td>
                                    <a href="%s" style="text-decoration:none;">
                                      <img src="cid:%s" alt="%s" width="180" style="max-width:180px;height:auto;border:0;display:block;"/>
                                    </a>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="text-transform:uppercase;font-size:14px;color:#999;padding-top:16px;" align="right">
                                    <span style="font-size:16px;">Order #%s</span>
                                  </td>
                                </tr>
                              </table>
                            </td></tr>
                          </table>
                        </center>
                      </td></tr>
                    </table>

                    <table style="width:100%%;border-spacing:0;border-collapse:collapse;">
                      <tr><td style="padding-bottom:40px;font-family:%s;">
                        <center>
                          <table class="container" style="width:560px;text-align:left;border-spacing:0;border-collapse:collapse;margin:0 auto;">
                            <tr><td>%s</td></tr>
                          </table>
                        </center>
                      </td></tr>
                    </table>

                    <table style="width:100%%;border-spacing:0;border-collapse:collapse;">
                      <tr><td style="padding:40px 0;font-family:%s;">
                        <center>
                          <table class="container" style="width:560px;text-align:left;border-spacing:0;border-collapse:collapse;margin:0 auto;">
                            <tr><td>%s</td></tr>
                          </table>
                        </center>
                      </td></tr>
                    </table>

                    %s

                    <table style="width:100%%;border-spacing:0;border-collapse:collapse;border-top:1px solid #e5e5e5;">
                      <tr><td style="padding:35px 0;font-family:%s;">
                        <center>
                          <table class="container" style="width:560px;text-align:left;border-spacing:0;border-collapse:collapse;margin:0 auto;">
                            <tr><td>
                              <p style="color:#999;line-height:150%%;font-size:14px;margin:0;">
                                If you have any questions, reply to this email or contact us at
                                <a href="mailto:%s" style="font-size:14px;text-decoration:none;color:%s;">%s</a>
                              </p>
                            </td></tr>
                          </table>
                        </center>
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
                </body></html>
                """.formatted(
                esc(title),
                FONT,
                safeUrl,
                LOGO_CID,
                safeShop,
                orderNumber,
                FONT,
                contentHtml,
                FONT,
                section1Html,
                section2,
                FONT,
                safeEmail,
                ACCENT,
                safeEmail);
    }

    private static String actionButtons(String orderUrl, String storeUrl) {
        return """
                <table style="width:100%%;border-spacing:0;border-collapse:collapse;margin-top:20px;">
                  <tr>
                    <td>
                      <table class="button main-action-cell" style="border-spacing:0;border-collapse:collapse;float:left;margin-right:15px;">
                        <tr>
                          <td style="border-radius:4px;" align="center" bgcolor="%s">
                            <a href="%s" style="font-size:16px;text-decoration:none;display:block;color:#fff;padding:20px 25px;">View your order</a>
                          </td>
                        </tr>
                      </table>
                      <table style="border-spacing:0;border-collapse:collapse;margin-top:19px;">
                        <tr>
                          <td style="border-radius:4px;" align="center">
                            or <a href="%s" style="font-size:16px;text-decoration:none;color:%s;">Visit our store</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                """.formatted(ACCENT, orderUrl, storeUrl, ACCENT);
    }

    private static String subtotalLine(String label, String value) {
        return """
                <tr>
                  <td style="padding:2px 0;">
                    <p style="color:#777;line-height:1.2em;font-size:16px;margin:4px 0 0;">
                      <span style="font-size:16px;">%s</span>
                    </p>
                  </td>
                  <td style="padding:2px 0;" align="right">
                    <span style="font-size:16px;">%s</span>
                  </td>
                </tr>
                """.formatted(esc(label), esc(value));
    }

    private static void appendItemsText(StringBuilder sb, ShopOrder order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            sb.append("(no line items)\n");
            return;
        }
        for (ShopOrderItem item : order.getItems()) {
            sb.append(item.getProductName())
                    .append(" × ")
                    .append(item.getQuantity())
                    .append("  ")
                    .append(formatMoney(item.getLineTotal(), order.getCurrency()))
                    .append('\n');
        }
    }

    private static String formatAddressHtml(ShopOrder order) {
        StringBuilder sb = new StringBuilder();
        sb.append(esc(nullToEmpty(order.getShippingName()))).append("<br/>");
        sb.append(esc(nullToEmpty(order.getShippingLine1()))).append("<br/>");
        if (order.getShippingLine2() != null && !order.getShippingLine2().isBlank()) {
            sb.append(esc(order.getShippingLine2().trim())).append("<br/>");
        }
        sb.append(esc(nullToEmpty(order.getShippingCity()))).append(' ')
                .append(esc(nullToEmpty(order.getShippingProvince()))).append(' ')
                .append(esc(nullToEmpty(order.getShippingPostal()))).append("<br/>");
        sb.append(esc(displayCountry(order.getShippingCountry())));
        return sb.toString();
    }

    private static String formatAddressText(ShopOrder order) {
        StringBuilder sb = new StringBuilder();
        sb.append(nullToEmpty(order.getShippingName())).append('\n');
        sb.append(nullToEmpty(order.getShippingLine1())).append('\n');
        if (order.getShippingLine2() != null && !order.getShippingLine2().isBlank()) {
            sb.append(order.getShippingLine2().trim()).append('\n');
        }
        sb.append(nullToEmpty(order.getShippingCity())).append(' ')
                .append(nullToEmpty(order.getShippingProvince())).append(' ')
                .append(nullToEmpty(order.getShippingPostal())).append('\n');
        sb.append(displayCountry(order.getShippingCountry()));
        return sb.toString();
    }

    static String formatMoney(BigDecimal amount, String currency) {
        String cur = currency == null || currency.isBlank() ? "CAD" : currency;
        if (amount == null) {
            return "$0.00";
        }
        return "$" + amount.setScale(2, RoundingMode.HALF_UP);
    }

    static String taxLabel(ShopOrder order) {
        if (order.getTaxName() != null && !order.getTaxName().isBlank()) {
            return order.getTaxName().trim();
        }
        return "Taxes";
    }

    static String displayCarrier(String carrier) {
        if (carrier == null || carrier.isBlank()) {
            return "Canada Post";
        }
        return switch (carrier.trim().toLowerCase(Locale.ROOT)) {
            case "canada_post", "canadapost", "canada-post" -> "Canada Post";
            default -> carrier.trim();
        };
    }

    private static String displayShippingMethod(ShopOrder order) {
        String method = order.getShippingMethod();
        if (method == null || method.isBlank() || "regular".equalsIgnoreCase(method.trim())) {
            return "Standard Shipping";
        }
        return method.trim();
    }

    private static String displayCountry(String code) {
        if (code == null || code.isBlank()) {
            return "";
        }
        return switch (code.trim().toUpperCase(Locale.ROOT)) {
            case "CA" -> "Canada";
            case "NZ" -> "New Zealand";
            case "US" -> "United States";
            default -> code.trim().toUpperCase(Locale.ROOT);
        };
    }

    private static String displayHost(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }
        String trimmed = url.trim();
        int scheme = trimmed.indexOf("://");
        String host = scheme >= 0 ? trimmed.substring(scheme + 3) : trimmed;
        int slash = host.indexOf('/');
        return slash >= 0 ? host.substring(0, slash) : host;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private static String esc(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
