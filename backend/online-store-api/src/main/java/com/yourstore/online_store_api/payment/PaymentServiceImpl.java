package com.yourstore.online_store_api.payment;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.yourstore.online_store_api.order.CreateOrderRequest;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;

/**
 * Guide 03 Step 2: pending order → Stripe Checkout Session → return checkout URL.
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private final OrderService orderService;
    private final CheckoutProperties checkoutProperties;

    PaymentServiceImpl(OrderService orderService, CheckoutProperties checkoutProperties) {
        this.orderService = orderService;
        this.checkoutProperties = checkoutProperties;
    }

    @Override
    public CheckoutSessionResponse createCheckoutSession(CreateOrderRequest request) {
        // 1. Server recomputes money (products + shipping) — never trust client totals
        OrderDTO order = orderService.createPendingOrder(request);

        // 2. Create Stripe Checkout Session (network call — outside order DB transaction)
        Session session;
        try {
            session = Session.create(buildSessionParams(order));
        } catch (StripeException e) {
            throw new IllegalStateException("Failed to create Stripe Checkout Session", e);
        }

        // 3. Persist session id for webhook lookup
        orderService.attachStripeCheckoutSession(order.getOrderNumber(), session.getId());

        // 4. Client redirects to hosted Checkout
        return new CheckoutSessionResponse(order.getOrderNumber(), session.getUrl());
    }

    private SessionCreateParams buildSessionParams(OrderDTO order) {
        long amountCents = toCents(order.getTotal());
        String successUrl = checkoutProperties.successUrl() + "?order=" + order.getOrderNumber();

        return SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(checkoutProperties.cancelUrl())
                .setClientReferenceId(order.getOrderNumber())
                .setCustomerEmail(order.getEmail())
                .putMetadata("orderNumber", order.getOrderNumber())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(order.getCurrency().toLowerCase())
                                                .setUnitAmount(amountCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Order " + order.getOrderNumber())
                                                                .build())
                                                .build())
                                .build())
                .build();
    }

    /** CAD dollars → Stripe cents: $19.95 → 1995. */
    static long toCents(BigDecimal amount) {
        return amount.movePointRight(2).longValueExact();
    }
}
