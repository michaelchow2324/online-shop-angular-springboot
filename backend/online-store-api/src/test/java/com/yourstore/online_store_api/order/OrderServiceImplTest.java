package com.yourstore.online_store_api.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.yourstore.online_store_api.order.CreateOrderRequest.OrderItemRequest;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;

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

    // injectMocks: inject the mock dependencies(orderRepository and productRepository) into the orderService
    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void stubOrderNumberUniqueness() {
        // lenient: error-path tests may throw before save / order-number checks
        lenient().when(orderRepository.existsByOrderNumber(anyString())).thenReturn(false);
        lenient().when(orderRepository.save(any(ShopOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));
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
        assertThat(dto.getShippingFee()).isEqualByComparingTo("0.00");
        assertThat(dto.getTax()).isEqualByComparingTo("0.00");
        assertThat(dto.getTotal()).isEqualByComparingTo("50.00");
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
        assertThat(dto.getTotal()).isEqualByComparingTo("45.00");
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
