package com.yourstore.online_store_api.auth;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.yourstore.online_store_api.config.SecurityConfig;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;
import com.yourstore.online_store_api.order.OrderStatus;

/**
 * Guide 05 Step 8 — {@code GET /api/me/orders}:
 * - requires JWT (401 without token)
 * - returns orders attached to the authenticated user (claimed guest orders after verify)
 */
@WebMvcTest(controllers = MeController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class MeOrdersWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Test
    void myOrders_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/me/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void myOrders_withPrincipal_returnsClaimedGuestOrders() throws Exception {
        Long userId = 7L;
        OrderDTO claimed = sampleOrder("OS-CLAIMED-1", "guest@example.com");
        when(orderService.findOrdersByUserId(userId)).thenReturn(List.of(claimed));

        CustomerPrincipal principal = new CustomerPrincipal(userId, "guest@example.com", "USER");
        var auth = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));

        mockMvc.perform(get("/api/me/orders").with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("OS-CLAIMED-1"))
                .andExpect(jsonPath("$[0].email").value("guest@example.com"));
    }

    private static OrderDTO sampleOrder(String orderNumber, String email) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderNumber(orderNumber);
        dto.setStatus(OrderStatus.PAID);
        dto.setEmail(email);
        dto.setCurrency("CAD");
        dto.setSubtotal(new BigDecimal("50.00"));
        dto.setShippingFee(new BigDecimal("9.95"));
        dto.setTax(new BigDecimal("0.00"));
        dto.setTotal(new BigDecimal("59.95"));
        dto.setShippingName("Alex Guest");
        dto.setShippingLine1("123 King St W");
        dto.setShippingCity("Toronto");
        dto.setShippingProvince("ON");
        dto.setShippingPostal("M5H 1A1");
        dto.setShippingCountry("CA");
        dto.setCreatedAt(LocalDateTime.now());
        dto.setItems(List.of());
        return dto;
    }
}
