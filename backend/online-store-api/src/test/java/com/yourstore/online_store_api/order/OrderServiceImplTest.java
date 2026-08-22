package com.yourstore.online_store_api.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.yourstore.online_store_api.account.CustomerAddress;
import com.yourstore.online_store_api.account.CustomerAddressRepository;
import com.yourstore.online_store_api.order.CreateOrderRequest.OrderItemRequest;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.notification.OrderPaidEvent;
import com.yourstore.online_store_api.notification.OrderRefundedEvent;
import com.yourstore.online_store_api.notification.OrderShippedEvent;
import com.yourstore.online_store_api.payment.StripeRefundClient;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.shipping.ShippingQuoteDTO;
import com.yourstore.online_store_api.shipping.ShippingService;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.tax.TaxQuote;
import com.yourstore.online_store_api.tax.TaxService;

// command to run this test: ./mvnw "-Dtest=OrderServiceImplTest,ShopOrderRepositoryTest" test
/**
 * Unit tests for {@link OrderServiceImpl#createPendingOrder}.
 * Repositories are mocked — no Spring context / DB required.
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private ShopOrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @Mock
    private ShippingService shippingService;

    @Mock
    private TaxService taxService;

    @Mock
    private CustomerAddressRepository addressRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private StripeRefundClient stripeRefundClient;

    // injectMocks: inject the mock dependencies into the orderService
    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void stubOrderNumberUniqueness() {
        // By default, Mockito is strict: if you stub a method and that test never calls it, Mockito fails the test with “unnecessary stubbing.”
        // lenient: tells Mockito to ignore this stubbing if it’s never called.(tells Mockito it is ok if this method is never called)

        lenient().when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false); // fake order number check, always return false
        lenient().when(orderRepository.save(any(ShopOrder.class))).thenAnswer(invocation -> invocation.getArgument(0)); //fake persists, return what was passed in
        lenient().when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(anyString(), any()))
                .thenReturn(List.of());
        lenient().when(shippingService.quote(anyString(), anyString(), any(BigDecimal.class))) 
                .thenReturn(new ShippingQuoteDTO(
                        "ON",
                        "regular",
                        new BigDecimal("9.95"),
                        new BigDecimal("75.00"),
                        new BigDecimal("25.00"),
                        1,
                        3,
                        new BigDecimal("7.79"),
                        new BigDecimal("0.1300"),
                        "HST",
                        new BigDecimal("67.74")));
        lenient().when(taxService.quote(anyString(), any(BigDecimal.class), any(BigDecimal.class)))
                .thenAnswer(invocation -> {
                    BigDecimal sub = invocation.getArgument(1);
                    BigDecimal ship = invocation.getArgument(2);
                    BigDecimal taxable = sub.add(ship);
                    BigDecimal amount = taxable
                            .multiply(new BigDecimal("0.13"))
                            .setScale(2, java.math.RoundingMode.HALF_UP);
                    return new TaxQuote(
                            new BigDecimal("0.1300"),
                            "HST",
                            taxable.setScale(2, java.math.RoundingMode.HALF_UP),
                            amount);
                });
    }

    @Test
    void createPendingOrder_computesTotalsFromDbPrices_notClient() {
        Product bag = activeProduct(10L, "Makeup Bag", "BAG-001", "25.00");
        // mock productRepository to return the bag product
        when(productRepository.findById(10L)).thenReturn(Optional.of(bag));

        CreateOrderRequest req = baseRequest();
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(10L);
        line.setQuantity(2);
        req.setItems(List.of(line));

        OrderDTO dto = orderService.createPendingOrder(req);

        assertThat(dto.getStatus()).isEqualTo(OrderStatus.PENDING_PAYMENT);
        assertThat(dto.getCurrency()).isEqualTo("CAD");
        assertThat(dto.getSubtotal()).isEqualByComparingTo("50.00"); // 25 * 2
        assertThat(dto.getShippingFee()).isEqualByComparingTo("9.95"); // from shippingService mock
        assertThat(dto.getShippingZone()).isEqualTo("ON");
        assertThat(dto.getTax()).isEqualByComparingTo("7.79"); // 13% HST on 50 + 9.95
        assertThat(dto.getTaxRate()).isEqualByComparingTo("0.1300");
        assertThat(dto.getTaxName()).isEqualTo("HST");
        assertThat(dto.getTotal()).isEqualByComparingTo("67.74"); // 50 + 9.95 + 7.79
        assertThat(dto.getOrderNumber()).startsWith("OS-");

        assertThat(dto.getItems()).hasSize(1);
        OrderItemDTO item = dto.getItems().get(0);
        assertThat(item.getProductId()).isEqualTo(10L);
        assertThat(item.getSku()).isEqualTo("BAG-001");
        assertThat(item.getProductName()).isEqualTo("Makeup Bag");
        assertThat(item.getUnitPrice()).isEqualByComparingTo("25.00");
        assertThat(item.getQuantity()).isEqualTo(2);
        assertThat(item.getLineTotal()).isEqualByComparingTo("50.00");

        // ArgumentCaptor: A Mockito “recorder” for the argument of a mock call
        // capture the argument of the save method call
        // verify(...).save(saved.capture()) is used to capture the argument of the save method call
        // The captor proves the service built the right domain object before saving
        // verify = “did you call save?” · capture = “show me exactly what you saved.”  
        ArgumentCaptor<ShopOrder> saved = ArgumentCaptor.forClass(ShopOrder.class);
        verify(orderRepository).save(saved.capture());
        assertThat(saved.getValue().getItems()).hasSize(1);
        assertThat(saved.getValue().getSubtotal()).isEqualByComparingTo("50.00");
    }

    /**
     * Guide 03 Step 6 — tampered totals: request has no price fields; even a huge qty
     * still prices each unit from the Product row in the DB.
     * this test is redundant because the request has no price fields
     */
    @Test
    void createPendingOrder_hugeQuantity_stillUsesDbUnitPrice() {
        when(productRepository.findById(10L))
                .thenReturn(Optional.of(activeProduct(10L, "Makeup Bag", "BAG-001", "25.00")));

        CreateOrderRequest req = baseRequest();
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(10L);
        line.setQuantity(999); // client could try to game qty; unit price must still be DB $25
        req.setItems(List.of(line));

        OrderDTO dto = orderService.createPendingOrder(req);

        assertThat(dto.getItems()).hasSize(1);
        assertThat(dto.getItems().get(0).getUnitPrice()).isEqualByComparingTo("25.00");
        assertThat(dto.getItems().get(0).getLineTotal()).isEqualByComparingTo("24975.00"); // 25 * 999
        assertThat(dto.getSubtotal()).isEqualByComparingTo("24975.00");
    }

    @Test
    void createPendingOrder_sumsMultipleLines() {
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(activeProduct(1L, "A", "SKU-A", "10.00")));
        when(productRepository.findById(2L))
                .thenReturn(Optional.of(activeProduct(2L, "B", "SKU-B", "7.50")));

        CreateOrderRequest req = baseRequest();
        OrderItemRequest a = new OrderItemRequest();
        a.setProductId(1L);
        a.setQuantity(3); // 30.00
        OrderItemRequest b = new OrderItemRequest();
        b.setProductId(2L);
        b.setQuantity(2); // 15.00
        req.setItems(List.of(a, b));

        OrderDTO dto = orderService.createPendingOrder(req);

        assertThat(dto.getSubtotal()).isEqualByComparingTo("45.00");
        assertThat(dto.getShippingFee()).isEqualByComparingTo("9.95");
        // 45 + 9.95 = 54.95 taxable; 13% HST = 7.14 → total 62.09
        assertThat(dto.getTax()).isEqualByComparingTo("7.14");
        assertThat(dto.getTotal()).isEqualByComparingTo("62.09");
        assertThat(dto.getItems()).hasSize(2);
    }

    @Test
    void createPendingOrder_rejectsUnknownProduct() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        CreateOrderRequest req = baseRequest();
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(999L);
        line.setQuantity(1);
        req.setItems(List.of(line));

        assertThatThrownBy(() -> orderService.createPendingOrder(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Product not found: 999");
    }

    @Test
    void createPendingOrder_rejectsInactiveProduct() {
        Product inactive = activeProduct(5L, "Old", "OLD", "9.00");
        inactive.setActive(false);
        when(productRepository.findById(5L)).thenReturn(Optional.of(inactive));

        CreateOrderRequest req = baseRequest();
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(5L);
        line.setQuantity(1);
        req.setItems(List.of(line));

        assertThatThrownBy(() -> orderService.createPendingOrder(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Product is not active: 5");
    }

    @Test
    void createPendingOrder_rejectsNonCanada() {
        CreateOrderRequest req = baseRequest();
        req.setShippingCountry("US");
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(1L);
        line.setQuantity(1);
        req.setItems(List.of(line));

        assertThatThrownBy(() -> orderService.createPendingOrder(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Shipping country must be CA");
    }

    @Test
    void createPendingOrder_withJwtAndEmptyAddress_usesDefaultAddress() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct(1L, "Bag", "BAG", "10.00")));
        CustomerAddress defaultAddr = defaultAddress(42L);
        when(addressRepository.findByUserIdAndDefaultAddressTrue(42L))
                .thenReturn(Optional.of(defaultAddr));

        CreateOrderRequest req = new CreateOrderRequest();
        req.setEmail("ignored@example.com");
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(1L);
        line.setQuantity(1);
        req.setItems(List.of(line));

        OrderDTO dto = orderService.createPendingOrder(req, 42L, "user@example.com");

        assertThat(dto.getEmail()).isEqualTo("user@example.com");
        assertThat(dto.getShippingName()).isEqualTo("Alex Default");
        assertThat(dto.getShippingLine1()).isEqualTo("100 Queen St W");
        assertThat(dto.getShippingCity()).isEqualTo("Toronto");
        assertThat(dto.getShippingProvince()).isEqualTo("ON");
        assertThat(dto.getShippingPostal()).isEqualTo("M5H 2N2");
        assertThat(dto.getShippingCountry()).isEqualTo("CA");
    }

    @Test
    void createPendingOrder_withJwtAndClientAddress_doesNotOverwriteWithDefault() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(activeProduct(1L, "Bag", "BAG", "10.00")));

        CreateOrderRequest req = baseRequest();
        req.setShippingName("Client Name");
        req.setShippingLine1("9 Client Ave");
        OrderItemRequest line = new OrderItemRequest();
        line.setProductId(1L);
        line.setQuantity(1);
        req.setItems(List.of(line));

        OrderDTO dto = orderService.createPendingOrder(req, 42L, "user@example.com");

        assertThat(dto.getShippingName()).isEqualTo("Client Name");
        assertThat(dto.getShippingLine1()).isEqualTo("9 Client Ave");
        verify(addressRepository, never()).findByUserIdAndDefaultAddressTrue(any());
    }

    @Test
    void findOrderByOrderNumberForUser_otherUsersOrder_throwsNotFound() {
        when(orderRepository.findByOrderNumberAndUserId("OS-OTHER", 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.findOrderByOrderNumberForUser("OS-OTHER", 1L))
                .isInstanceOf(com.yourstore.common.NotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void markPaidFromStripeCheckout_setsPaidAndPublishesEvent() {
        ShopOrder order = pendingOrderWithSession("cs_test_1", "OS-TEST-1");
        when(orderRepository.findByStripeCheckoutSessionId("cs_test_1")).thenReturn(Optional.of(order));

        orderService.markPaidFromStripeCheckout("cs_test_1", "pi_test_1", "OS-TEST-1");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        assertThat(order.getPaidAt()).isNotNull();
        assertThat(order.getStripePaymentIntentId()).isEqualTo("pi_test_1");
        verify(eventPublisher).publishEvent(new OrderPaidEvent(order.getId()));
    }

    @Test
    void markPaidFromStripeCheckout_secondCallIsIdempotent() {
        ShopOrder order = pendingOrderWithSession("cs_test_1", "OS-TEST-1");
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());
        order.setStripePaymentIntentId("pi_test_1");
        when(orderRepository.findByStripeCheckoutSessionId("cs_test_1")).thenReturn(Optional.of(order));

        orderService.markPaidFromStripeCheckout("cs_test_1", "pi_test_1", "OS-TEST-1");

        verify(orderRepository, never()).save(any(ShopOrder.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void shipOrder_fromPaid_setsTrackingAndPublishesEvent() {
        ShopOrder order = paidOrder("OS-SHIP-1");
        when(orderRepository.findByOrderNumber("OS-SHIP-1")).thenReturn(Optional.of(order));

        ShipOrderRequest req = new ShipOrderRequest();
        req.setCarrier("canada_post");
        req.setTrackingNumber("1234567890123456");

        OrderDTO dto = orderService.shipOrder("OS-SHIP-1", req);

        assertThat(dto.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(dto.getCarrier()).isEqualTo("canada_post");
        assertThat(dto.getTrackingNumber()).isEqualTo("1234567890123456");
        assertThat(dto.getShippedAt()).isNotNull();
        verify(eventPublisher).publishEvent(new OrderShippedEvent(order.getId()));
    }

    @Test
    void shipOrder_fromFulfilling_allowed() {
        ShopOrder order = paidOrder("OS-SHIP-2");
        order.setStatus(OrderStatus.FULFILLING);
        when(orderRepository.findByOrderNumber("OS-SHIP-2")).thenReturn(Optional.of(order));

        ShipOrderRequest req = new ShipOrderRequest();
        req.setCarrier("canada_post");
        req.setTrackingNumber("CC-999");

        OrderDTO dto = orderService.shipOrder("OS-SHIP-2", req);

        assertThat(dto.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        assertThat(dto.getCarrier()).isEqualTo("canada_post");
        verify(eventPublisher).publishEvent(new OrderShippedEvent(order.getId()));
    }

    @Test
    void shipOrder_rejectsUnsupportedCarrier() {
        ShopOrder order = paidOrder("OS-SHIP-CC");
        when(orderRepository.findByOrderNumber("OS-SHIP-CC")).thenReturn(Optional.of(order));

        ShipOrderRequest req = new ShipOrderRequest();
        req.setCarrier("chit_chats");
        req.setTrackingNumber("CC-999");

        assertThatThrownBy(() -> orderService.shipOrder("OS-SHIP-CC", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported carrier");
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void shipOrder_alreadyShippedSameTracking_isIdempotent() {
        ShopOrder order = paidOrder("OS-SHIP-3");
        order.setStatus(OrderStatus.SHIPPED);
        order.setCarrier("canada_post");
        order.setTrackingNumber("1234567890123456");
        order.setShippedAt(LocalDateTime.now());
        when(orderRepository.findByOrderNumber("OS-SHIP-3")).thenReturn(Optional.of(order));

        ShipOrderRequest req = new ShipOrderRequest();
        req.setCarrier("canada_post");
        req.setTrackingNumber("1234567890123456");

        OrderDTO dto = orderService.shipOrder("OS-SHIP-3", req);

        assertThat(dto.getStatus()).isEqualTo(OrderStatus.SHIPPED);
        verify(orderRepository, never()).save(any(ShopOrder.class));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void shipOrder_alreadyShippedDifferentTracking_rejected() {
        ShopOrder order = paidOrder("OS-SHIP-4");
        order.setStatus(OrderStatus.SHIPPED);
        order.setCarrier("canada_post");
        order.setTrackingNumber("OLD-TRACK");
        when(orderRepository.findByOrderNumber("OS-SHIP-4")).thenReturn(Optional.of(order));

        ShipOrderRequest req = new ShipOrderRequest();
        req.setCarrier("canada_post");
        req.setTrackingNumber("NEW-TRACK");

        assertThatThrownBy(() -> orderService.shipOrder("OS-SHIP-4", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already shipped");
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void shipOrder_pendingPayment_rejected() {
        ShopOrder order = paidOrder("OS-SHIP-5");
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        when(orderRepository.findByOrderNumber("OS-SHIP-5")).thenReturn(Optional.of(order));

        ShipOrderRequest req = new ShipOrderRequest();
        req.setCarrier("canada_post");
        req.setTrackingNumber("123");

        assertThatThrownBy(() -> orderService.shipOrder("OS-SHIP-5", req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must be paid or fulfilling");
    }

    @Test
    void refundOrder_fromPaid_callsStripeAndPublishesEvent() {
        ShopOrder order = paidOrder("OS-REF-1");
        order.setStripePaymentIntentId("pi_test_1");
        when(orderRepository.findByOrderNumber("OS-REF-1")).thenReturn(Optional.of(order));
        when(stripeRefundClient.createFullRefund("pi_test_1")).thenReturn("re_test_1");

        OrderDTO dto = orderService.refundOrder("OS-REF-1", new RefundOrderRequest());

        assertThat(dto.getStatus()).isEqualTo(OrderStatus.REFUNDED);
        assertThat(dto.getRefundedAt()).isNotNull();
        assertThat(order.getStripeRefundId()).isEqualTo("re_test_1");
        verify(stripeRefundClient).createFullRefund("pi_test_1");
        verify(eventPublisher).publishEvent(new OrderRefundedEvent(order.getId()));
    }

    @Test
    void refundOrder_alreadyRefunded_isIdempotent() {
        ShopOrder order = paidOrder("OS-REF-2");
        order.setStatus(OrderStatus.REFUNDED);
        order.setRefundedAt(LocalDateTime.now());
        order.setStripeRefundId("re_existing");
        when(orderRepository.findByOrderNumber("OS-REF-2")).thenReturn(Optional.of(order));

        OrderDTO dto = orderService.refundOrder("OS-REF-2", new RefundOrderRequest());

        assertThat(dto.getStatus()).isEqualTo(OrderStatus.REFUNDED);
        verify(stripeRefundClient, never()).createFullRefund(anyString());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void refundOrder_pendingPayment_rejected() {
        ShopOrder order = paidOrder("OS-REF-3");
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        when(orderRepository.findByOrderNumber("OS-REF-3")).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.refundOrder("OS-REF-3", new RefundOrderRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be refunded");
    }

    @Test
    void refundOrder_missingPaymentIntent_rejected() {
        ShopOrder order = paidOrder("OS-REF-4");
        order.setStripePaymentIntentId(null);
        when(orderRepository.findByOrderNumber("OS-REF-4")).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.refundOrder("OS-REF-4", new RefundOrderRequest()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("payment intent");
    }

    @Test
    void findOrdersByStatus_returnsNewestFirstMappedDtos() {
        ShopOrder a = paidOrder("OS-A");
        ShopOrder b = paidOrder("OS-B");
        when(orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PAID))
                .thenReturn(List.of(a, b));

        List<OrderDTO> result = orderService.findOrdersByStatus(OrderStatus.PAID);

        assertThat(result).extracting(OrderDTO::getOrderNumber).containsExactly("OS-A", "OS-B");
    }

    @Test
    void cancelExpiredPendingPayments_delegatesCutoffToRepository() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);
        when(orderRepository.cancelStalePendingPayments(
                        eq(OrderStatus.PENDING_PAYMENT),
                        eq(OrderStatus.CANCELLED),
                        eq(cutoff),
                        any(LocalDateTime.class)))
                .thenReturn(3);

        int cancelled = orderService.cancelExpiredPendingPayments(cutoff);

        assertThat(cancelled).isEqualTo(3);
        verify(orderRepository)
                .cancelStalePendingPayments(
                        eq(OrderStatus.PENDING_PAYMENT),
                        eq(OrderStatus.CANCELLED),
                        eq(cutoff),
                        any(LocalDateTime.class));
    }

    @Test
    void cancelExpiredPendingPayments_nullCutoff_rejected() {
        assertThatThrownBy(() -> orderService.cancelExpiredPendingPayments(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Cutoff");
        verify(orderRepository, never())
                .cancelStalePendingPayments(any(), any(), any(), any());
    }

    @Test
    void markPaidFromStripe_cancelledOrder_stillMarksPaid() {
        ShopOrder order = pendingOrderWithSession("cs_late", "OS-LATE");
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findByStripeCheckoutSessionId("cs_late")).thenReturn(Optional.of(order));

        orderService.markPaidFromStripeCheckout("cs_late", "pi_late", "OS-LATE");

        assertThat(order.getStatus()).isEqualTo(OrderStatus.PAID);
        verify(eventPublisher).publishEvent(new OrderPaidEvent(order.getId()));
    }

    private static ShopOrder pendingOrderWithSession(String sessionId, String orderNumber) {
        ShopOrder order = new ShopOrder();
        order.setId(42L);
        order.setOrderNumber(orderNumber);
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setStripeCheckoutSessionId(sessionId);
        return order;
    }

    private static ShopOrder paidOrder(String orderNumber) {
        ShopOrder order = new ShopOrder();
        order.setId(99L);
        order.setOrderNumber(orderNumber);
        order.setStatus(OrderStatus.PAID);
        order.setEmail("buyer@example.com");
        order.setCurrency("CAD");
        order.setSubtotal(new BigDecimal("50.00"));
        order.setShippingFee(new BigDecimal("9.95"));
        order.setTax(new BigDecimal("0.00"));
        order.setTotal(new BigDecimal("59.95"));
        order.setShippingName("Alex");
        order.setShippingLine1("123 King");
        order.setShippingCity("Toronto");
        order.setShippingProvince("ON");
        order.setShippingPostal("M5H 1A1");
        order.setShippingCountry("CA");
        order.setShippingMethod("regular");
        order.setPaidAt(LocalDateTime.now());
        return order;
    }

    private static CreateOrderRequest baseRequest() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setEmail("guest@example.com");
        req.setShippingName("Alex Guest");
        req.setShippingLine1("123 King St W");
        req.setShippingCity("Toronto");
        req.setShippingProvince("ON");
        req.setShippingPostal("M5H 1A1");
        req.setShippingCountry("CA");
        return req;
    }

    private static CustomerAddress defaultAddress(Long userId) {
        CustomerAddress address = new CustomerAddress();
        address.setId(9L);
        address.setUserId(userId);
        address.setLabel("Home");
        address.setRecipientName("Alex Default");
        address.setPhone("416-555-0100");
        address.setLine1("100 Queen St W");
        address.setCity("Toronto");
        address.setProvince("ON");
        address.setPostal("M5H 2N2");
        address.setCountry("CA");
        address.setDefaultAddress(true);
        return address;
    }

    private static Product activeProduct(Long id, String name, String sku, String price) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setSlug(name.toLowerCase().replace(' ', '-'));
        p.setSku(sku);
        p.setPrice(new BigDecimal(price));
        p.setActive(true);
        return p;
    }
}
