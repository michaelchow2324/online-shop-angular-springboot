package com.yourstore.online_store_api.payment;

import java.math.BigDecimal;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.yourstore.online_store_api.order.CreateOrderRequest;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;

/**
 * Guide 03: Checkout Session create + webhook mark-paid.
 */
@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);

    // LoggerFactory.getLogger(...): Create/get the logger from SLF4J (Spring Boot’s usual logging API)
    // PaymentServiceImpl.class: Name the logger after this class (so log lines show which class wrote them)
    // private static final: One shared logger for the class; not recreated per instance

    private static final String EVENT_CHECKOUT_COMPLETED = "checkout.session.completed";
    private static final String EVENT_ASYNC_PAYMENT_SUCCEEDED = "checkout.session.async_payment_succeeded";

    private final OrderService orderService;
    private final CheckoutProperties checkoutProperties;
    private final StripeProperties stripeProperties;

    PaymentServiceImpl(
            OrderService orderService,
            CheckoutProperties checkoutProperties,
            StripeProperties stripeProperties) {
        this.orderService = orderService;
        this.checkoutProperties = checkoutProperties;
        this.stripeProperties = stripeProperties;
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

    // Stripe webhook body:
    // {
    //     "id": "evt_...",
    //     "type": "checkout.session.completed",
    //     "data": {
    //       "object": { /* the Checkout Session */ }
    //     }
    //   }
    // After you verify the signature, Webhook.constructEvent(...) return a Stripe Event object
    // Event = notification envelope; Session = the checkout details inside it.

    // 1. Stripe Event (webhook)
    // Stripe’s JSON notification: “checkout finished.” 

    // 2. Spring / Java app event (your OrderPaidEvent)
    // An object your app publishes inside the JVM so other code can react:

    // order marked PAID
    // → eventPublisher.publishEvent(new OrderPaidEvent(orderId)) (java event)
    // → later a listener sends email (guide 06)

    @Override
    public void handleStripeWebhook(String payload, String sigHeader) throws SignatureVerificationException {
        Event event = Webhook.constructEvent(payload, sigHeader, stripeProperties.webhookSecret());

        // 1. Validate event type (only handle checkout.session.completed and checkout.session.async_payment_succeeded)
        String type = event.getType();
        if (!EVENT_CHECKOUT_COMPLETED.equals(type) && !EVENT_ASYNC_PAYMENT_SUCCEEDED.equals(type)) {
            log.debug("Ignoring Stripe event type: {}", type);
            return;
        }

        Session session = deserializeSession(event);
        String orderNumber = resolveOrderNumber(session);
        String paymentIntentId = extractPaymentIntentId(session);

        orderService.markPaidFromStripeCheckout(session.getId(), paymentIntentId, orderNumber);
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

    // In your MVP you send one line item: the whole order total.


    // Line item
    // ├─ quantity: 1
    // └─ priceData
    // ├─ currency: cad
    // ├─ unitAmount: 1995   ← cents ($19.95)
    // └─ productData.name: "Order OS-20260802-A1B2"

    // the event we constructed from the webhook payload:
    // {
    //     "id": "evt_...",
    //     "type": "checkout.session.completed",
    //     "data": {
    //       "object": { /* the Checkout Session */ }
    //     }
    //   }

    /*
        Why deserialize?

        The webhook body is raw JSON. After signature verify you get a Stripe Event, and the useful part is nested JSON like:

        {
        "type": "checkout.session.completed",
        "data": { "object": { "id": "cs_test_...", "metadata": { "orderNumber": "OS-..." }, ... } }
        }
        Deserialize = turn that JSON into a Java Session object so you can call:

        session.getId()
        session.getMetadata() / getClientReferenceId()
        session.getPaymentIntent()
    */
    private static Session deserializeSession(Event event) {
        // Session:Stripe’s object for one checkout attempt: id (cs_test_...), amount, email, metadata (orderNumber), payment intent id, success/cancel URLs, etc. 
        // You create it in Session.create(...); the customer pays on that session’s URL.
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer(); // get the "data" object from the event
        // the safe path: Stripe only returns a Session if the event’s API version matches your Java SDK.
        StripeObject stripeObject = deserializer.getObject().orElse(null); // get the "object" object from the "data" object
        if (stripeObject instanceof Session session) { // check if the "object" object is a Stripe Session object
            return session;
        }
        // If versions don’t match (Dashboard/CLI uses a newer API than stripe-java 28.x), getObject() is empty even though the JSON is fine. Then you’d fail and never mark the order paid.
        // If the "object" object is not a Stripe Session object, try to deserialize it as an unsafe object(A fallback plan)
        // parse the JSON into a Session anyway.” You might miss brand-new fields, but you still get id, metadata, payment_intent — enough to mark paid.
        try {
            StripeObject unsafe = deserializer.deserializeUnsafe();
            if (unsafe instanceof Session session) {
                return session;
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize Stripe checkout Session", e);
        }
        throw new IllegalStateException("Stripe event missing checkout Session payload");
    }

    // when we create session, we store order number in:
    //  .setClientReferenceId(order.getOrderNumber())
    // .putMetadata("orderNumber", order.getOrderNumber())
    // so we can get ordernnumber from ordernumber metadata or client reference id
    private static String resolveOrderNumber(Session session) {
        Map<String, String> metadata = session.getMetadata();
        if (metadata != null) {
            String fromMeta = metadata.get("orderNumber");
            if (fromMeta != null && !fromMeta.isBlank()) {
                return fromMeta;
            }
        }
        return session.getClientReferenceId();
    }

    private static String extractPaymentIntentId(Session session) {
        return session.getPaymentIntent();
    }

    /** CAD dollars → Stripe cents: $19.95 → 1995. */
    static long toCents(BigDecimal amount) {
        return amount.movePointRight(2).longValueExact();
    }
}
