package com.yourstore.online_store_api.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.yourstore.online_store_api.auth.CustomerPrincipal;
import com.yourstore.online_store_api.auth.JwtAuthenticationFilter;
import com.yourstore.online_store_api.auth.JwtService;
import com.yourstore.online_store_api.config.SecurityConfig;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;
import com.yourstore.online_store_api.order.OrderStatus;
import com.yourstore.online_store_api.order.ShipOrderRequest;

/**
 * Guide 07 — {@code /api/admin/orders/**} requires ROLE_ADMIN.
 */
@WebMvcTest(controllers = AdminOrderController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class AdminOrderControllerWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void list_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/orders").param("status", "paid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void list_asUser_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/orders").param("status", "paid").with(authentication(userAuth())))
                .andExpect(status().isForbidden());
    }

    @Test
    void list_asAdmin_returnsPaidOrders() throws Exception {
        when(orderService.findOrdersByStatus(OrderStatus.PAID))
                .thenReturn(List.of(sampleOrder("OS-PAID-1", OrderStatus.PAID)));

        mockMvc.perform(get("/api/admin/orders").param("status", "paid").with(authentication(adminAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("OS-PAID-1"))
                .andExpect(jsonPath("$[0].status").value("PAID"));
    }

    @Test
    void ship_asAdmin_returnsShippedOrder() throws Exception {
        OrderDTO shipped = sampleOrder("OS-PAID-1", OrderStatus.SHIPPED);
        shipped.setCarrier("canada_post");
        shipped.setTrackingNumber("1234567890123456");
        when(orderService.shipOrder(eq("OS-PAID-1"), any(ShipOrderRequest.class))).thenReturn(shipped);

        mockMvc.perform(post("/api/admin/orders/OS-PAID-1/ship")
                        .with(authentication(adminAuth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"carrier":"canada_post","trackingNumber":"1234567890123456"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"))
                .andExpect(jsonPath("$.trackingNumber").value("1234567890123456"));
    }

    private static UsernamePasswordAuthenticationToken adminAuth() {
        CustomerPrincipal principal = new CustomerPrincipal(1L, "admin@localhost", "ADMIN");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
    }

    private static UsernamePasswordAuthenticationToken userAuth() {
        CustomerPrincipal principal = new CustomerPrincipal(2L, "user@example.com", "USER");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
    }

    private static OrderDTO sampleOrder(String orderNumber, OrderStatus status) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderNumber(orderNumber);
        dto.setStatus(status);
        dto.setEmail("buyer@example.com");
        dto.setCurrency("CAD");
        dto.setSubtotal(new BigDecimal("50.00"));
        dto.setShippingFee(new BigDecimal("9.95"));
        dto.setTax(new BigDecimal("0.00"));
        dto.setTotal(new BigDecimal("59.95"));
        dto.setShippingName("Alex");
        dto.setShippingLine1("123 King");
        dto.setShippingCity("Toronto");
        dto.setShippingProvince("ON");
        dto.setShippingPostal("M5H 1A1");
        dto.setShippingCountry("CA");
        dto.setCreatedAt(LocalDateTime.now());
        dto.setItems(List.of());
        return dto;
    }
}
