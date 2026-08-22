package com.yourstore.online_store_api.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.yourstore.online_store_api.auth.CustomerPrincipal;
import com.yourstore.online_store_api.order.CreateOrderRequest;
import com.yourstore.online_store_api.order.CreateOrderRequest.OrderItemRequest;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;
import com.yourstore.online_store_api.order.OrderStatus;

/**
 * Unit tests for {@link PaymentServiceImpl}.
 * Stripe static APIs ({@code Session.create}, {@code Webhook.constructEvent}) are mocked —
 * no network / Stripe CLI required.
 */
@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private OrderService orderService;

    private PaymentServiceImpl paymentService;

    // hand-built CheckoutProperties and StripeProperties, no Spring context. in unit test we dont load spring context
    // Construct PaymentServiceImpl manually: inject the @Mock OrderService + plain property records.
    @BeforeEach
    void setUp() {
        paymentService = new PaymentServiceImpl(
                orderService,
                new CheckoutProperties(
                        "http://localhost:4200/checkout/success",
                        "http://localhost:4200/cart"),
                new StripeProperties("sk_test_x", "whsec_test_x"));
    }

    @Test
    void createCheckoutSession_usesServerOrderTotal_andReturnsHostedUrl() {
        // Stub OrderService so createCheckoutSession does not hit DB — returns a known pending order total.
        OrderDTO pending = samplePendingOrder("OS-TEST-1", "59.95");
        when(orderService.createPendingOrder(any(CreateOrderRequest.class))).thenReturn(pending);

        // we can mock an object inside a method, not neccessary to inject a whole class
        // session.getID(), sessoin.getUrl() are instance methods
        Session stripeSession = mock(Session.class);
        when(stripeSession.getId()).thenReturn("cs_test_abc");
        when(stripeSession.getUrl()).thenReturn("https://checkout.stripe.com/c/pay/cs_test_abc");

        // mock()/ @Mock only work on instances; Session.create(...) is static → need MockedStatic.
        // try-with-resources: when the block ends, static mocking is undone (other tests stay clean).
        try (MockedStatic<Session> sessionStatic = mockStatic(Session.class)) {
            // Captor records the SessionCreateParams PaymentServiceImpl passed into Session.create(...)
            ArgumentCaptor<SessionCreateParams> paramsCaptor =
                    ArgumentCaptor.forClass(SessionCreateParams.class);

            // When production code calls Session.create(...), capture the args and return our fake instance.
            // Handoff: static create → stripeSession (so later getId()/getUrl() use the instance mock above).
            sessionStatic.when(() -> Session.create(paramsCaptor.capture())).thenReturn(stripeSession);

            // Runs real PaymentServiceImpl (no Stripe network — create is stubbed).
            // orderservice.creatependingorder is called and mock will return the pending order
            CheckoutSessionResponse response = paymentService.createCheckoutSession(baseRequest(), null);

            // Response built from the mocked Session instance (orderNumber from OrderDTO, url from getUrl()).
            assertThat(response.orderNumber()).isEqualTo("OS-TEST-1");
            assertThat(response.checkoutUrl())
                    .isEqualTo("https://checkout.stripe.com/c/pay/cs_test_abc");

            // Inspect what we sent to Stripe: amount must be server order total in cents ($59.95 → 5995).
            SessionCreateParams params = paramsCaptor.getValue();
            assertThat(params.getMode()).isEqualTo(SessionCreateParams.Mode.PAYMENT);
            assertThat(params.getClientReferenceId()).isEqualTo("OS-TEST-1");
            assertThat(params.getSuccessUrl())
                    .isEqualTo("http://localhost:4200/checkout/success?order=OS-TEST-1");
            assertThat(params.getLineItems()).hasSize(1);
            assertThat(params.getLineItems().get(0).getPriceData().getUnitAmount())
                    .isEqualTo(5995L);

            // Side effects on OrderService: pending order created, then session id attached.
            // verify if these methods with these parameters are called once
            verify(orderService).createPendingOrder(any(CreateOrderRequest.class));
            verify(orderService).attachStripeCheckoutSession("OS-TEST-1", "cs_test_abc");
        }
    }

    @Test
    void createCheckoutSession_withJwt_attachesUserAndForcesAccountEmail() {
        OrderDTO pending = samplePendingOrder("OS-TEST-2", "59.95");
        when(orderService.createPendingOrder(
                any(CreateOrderRequest.class), eq(42L), eq("account@example.com")))
                .thenReturn(pending);

        Session stripeSession = mock(Session.class);
        when(stripeSession.getId()).thenReturn("cs_test_logged_in");
        when(stripeSession.getUrl()).thenReturn("https://checkout.stripe.com/c/pay/cs_test_logged_in");

        try (MockedStatic<Session> sessionStatic = mockStatic(Session.class)) {
            sessionStatic.when(() -> Session.create(any(SessionCreateParams.class))).thenReturn(stripeSession);

            CustomerPrincipal principal = new CustomerPrincipal(42L, "account@example.com", "USER");
            CreateOrderRequest req = baseRequest();
            req.setEmail("someone-else@example.com"); // must be ignored when JWT present

            CheckoutSessionResponse response = paymentService.createCheckoutSession(req, principal);

            assertThat(response.orderNumber()).isEqualTo("OS-TEST-2");
            verify(orderService).createPendingOrder(
                    any(CreateOrderRequest.class), eq(42L), eq("account@example.com"));
            verify(orderService).attachStripeCheckoutSession("OS-TEST-2", "cs_test_logged_in");
        }
    }

    @Test
    void handleStripeWebhook_checkoutCompleted_marksOrderPaid() throws Exception {
        // Fake Stripe Event envelope whose nested Session has id / paymentIntent / orderNumber metadata.
        Event event = checkoutCompletedEvent("cs_test_1", "pi_test_1", "OS-TEST-1");

        // Webhook.constructEvent is static (signature verify) → MockedStatic, same pattern as Session.create.
        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            // Only match this exact payload + sig + webhook secret from setUp (whsec_test_x).
            webhookStatic
                    .when(() -> Webhook.constructEvent(eq("payload"), eq("sig_header"), eq("whsec_test_x")))
                    .thenReturn(event);

            // Production path: verify signature → deserialize Session → markPaidFromStripeCheckout(...)
            // call the method, dont need to run from controller
            paymentService.handleStripeWebhook("payload", "sig_header");

            // Prove we forwarded the right ids from the Session inside the Event.
            verify(orderService).markPaidFromStripeCheckout("cs_test_1", "pi_test_1", "OS-TEST-1");
        }
    }

    @Test
    void handleStripeWebhook_secondCall_stillDelegates_idempotencyInOrderService() throws Exception {
        // Same completed event delivered twice (Stripe retry / CLI resend).
        Event event = checkoutCompletedEvent("cs_test_1", "pi_test_1", "OS-TEST-1");

        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            webhookStatic
                    .when(() -> Webhook.constructEvent(eq("payload"), eq("sig_header"), eq("whsec_test_x")))
                    .thenReturn(event);

            // mock when stripe sends the same event to our webhook controller twice
            paymentService.handleStripeWebhook("payload", "sig_header");
            paymentService.handleStripeWebhook("payload", "sig_header");

            // Payment layer always forwards; OrderService.markPaidFromStripeCheckout no-ops if already PAID
            // (see OrderServiceImplTest.markPaidFromStripeCheckout_secondCallIsIdempotent).
            verify(orderService, times(2))
                    .markPaidFromStripeCheckout("cs_test_1", "pi_test_1", "OS-TEST-1");
        }
    }

    @Test
    void handleStripeWebhook_ignoresUnrelatedEventTypes() throws Exception {
        // Stripe sends many event types; we only act on checkout.session.completed (and async_payment_succeeded).
        Event event = mock(Event.class);
        when(event.getType()).thenReturn("payment_intent.created");

        try (MockedStatic<Webhook> webhookStatic = mockStatic(Webhook.class)) {
            // any() matchers: we don't care about payload/sig here — only that constructEvent returns this event.
            // mock stripe sends other event types, we ignore them
            webhookStatic
                    .when(() -> Webhook.constructEvent(any(), any(), any()))
                    .thenReturn(event);

            paymentService.handleStripeWebhook("payload", "sig_header");

            // Early return on unknown type → never touch OrderService.
            verify(orderService, times(0)).markPaidFromStripeCheckout(any(), any(), any());
        }
    }

    @Test
    void toCents_convertsCadDollars() {
        // Stripe amounts are integer cents: $19.95 → 1995, $0.01 → 1.
        assertThat(PaymentServiceImpl.toCents(new BigDecimal("19.95"))).isEqualTo(1995L);
        assertThat(PaymentServiceImpl.toCents(new BigDecimal("0.01"))).isEqualTo(1L);
    }

    /**
     * Builds a fake Stripe webhook Event for checkout.session.completed.
     * Mirrors production deserialize path: Event → EventDataObjectDeserializer → Session.
     */
    private static Event checkoutCompletedEvent(String sessionId, String paymentIntentId, String orderNumber) {
        // Instance mock: fields PaymentServiceImpl reads after deserializeSession(...).
        Session session = mock(Session.class);
        when(session.getId()).thenReturn(sessionId);
        when(session.getPaymentIntent()).thenReturn(paymentIntentId);
        when(session.getMetadata()).thenReturn(Map.of("orderNumber", orderNumber));

        // Deserializer.getObject() returns Optional.of(session) — the "safe" deserialize path in production.
        EventDataObjectDeserializer deserializer = mock(EventDataObjectDeserializer.class);
        when(deserializer.getObject()).thenReturn(Optional.of(session));

        // Event envelope: type gates handling; deserializer supplies the nested Session.
        Event event = mock(Event.class);
        when(event.getType()).thenReturn("checkout.session.completed");
        when(event.getDataObjectDeserializer()).thenReturn(deserializer);
        return event;
    }

    /** Minimal pending OrderDTO — only orderNumber / total / currency matter for Session.create params. */
    private static OrderDTO samplePendingOrder(String orderNumber, String total) {
        return new OrderDTO(
                orderNumber,
                OrderStatus.PENDING_PAYMENT,
                "guest@example.com",
                "CAD",
                new BigDecimal("50.00"),
                new BigDecimal("9.95"),
                new BigDecimal("0.00"),
                new BigDecimal("0.13"),
                "HST",
                new BigDecimal(total),
                "Alex Guest",
                null,
                "123 King St W",
                null,
                "Toronto",
                "ON",
                "M5H 1A1",
                "CA",
                "ON",
                "regular",
                null,
                null,
                null,
                null,
                null,
                null,
                List.of());
    }

    /** Shared checkout request body (email + address + one line) — no price fields (server prices from DB). */
    private static CreateOrderRequest baseRequest() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setEmail("guest@example.com");
        req.setShippingName("Alex Guest");
        req.setShippingLine1("123 King St W");
        req.setShippingCity("Toronto");
        req.setShippingProvince("ON");
        req.setShippingPostal("M5H 1A1");
        req.setShippingCountry("CA");
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(10L);
        line.setQuantity(2);
        req.setItems(List.of(line));
        return req;
    }
}
