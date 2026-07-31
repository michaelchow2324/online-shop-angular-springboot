package com.yourstore.online_store_api.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

/**
 * ShopOrderRepositoryTest asks: “If we save a ShopOrder with items, does Hibernate actually write and reload them correctly?”
 * 
Specifically it proves:

cascade = ALL works — you only save(order); the item row is inserted too
addItem wired both sides — item has order_id / item.getOrder() points back
findByOrderNumber works — custom query returns the order
Items load after save — loaded.getItems() has the snapshotted name / line total
So it’s a safety net for entity annotations (@OneToMany, @ManyToOne, column names, cascade). If those were wrong, the service unit test could still pass (mocks don’t hit the DB), but checkout would fail in real Postgres.
 */





/**
 * Slice test: persists {@link ShopOrder} + cascaded {@link ShopOrderItem}s.
 * Uses H2 (test scope); Flyway is off so Hibernate creates tables from entities.
 */
@DataJpaTest
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class ShopOrderRepositoryTest {

    @Autowired
    private ShopOrderRepository orderRepository;

    @Test
    void save_cascadesItems_andFindByOrderNumberLoadsThem() {
        ShopOrder order = new ShopOrder();
        order.setOrderNumber("OS-20260731-TEST");
        order.setEmail("guest@example.com");
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setCurrency("CAD");
        order.setSubtotal(new BigDecimal("50.00"));
        order.setShippingFee(new BigDecimal("0.00"));
        order.setTax(new BigDecimal("0.00"));
        order.setTotal(new BigDecimal("50.00"));
        order.setShippingName("Alex Guest");
        order.setShippingLine1("123 King St W");
        order.setShippingCity("Toronto");
        order.setShippingProvince("ON");
        order.setShippingPostal("M5H 1A1");
        order.setShippingCountry("CA");
        order.setShippingMethod("regular");
        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        ShopOrderItem item = new ShopOrderItem();
        item.setProductId(10L);
        item.setSku("BAG-001");
        item.setProductName("Makeup Bag");
        item.setUnitPrice(new BigDecimal("25.00"));
        item.setQuantity(2);
        item.setLineTotal(new BigDecimal("50.00"));
        order.addItem(item);

        orderRepository.saveAndFlush(order);

        ShopOrder loaded = orderRepository.findByOrderNumber("OS-20260731-TEST").orElseThrow();
        assertThat(loaded.getId()).isNotNull();
        assertThat(loaded.getItems()).hasSize(1);
        assertThat(loaded.getItems().get(0).getProductName()).isEqualTo("Makeup Bag");
        assertThat(loaded.getItems().get(0).getLineTotal()).isEqualByComparingTo("50.00");
        assertThat(loaded.getItems().get(0).getOrder().getId()).isEqualTo(loaded.getId());
    }
}
