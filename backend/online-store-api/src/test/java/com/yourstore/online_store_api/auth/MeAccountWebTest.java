package com.yourstore.online_store_api.auth;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
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

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.account.AccountService;
import com.yourstore.online_store_api.config.SecurityConfig;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;
import com.yourstore.online_store_api.order.OrderStatus;

/**
 * Guide 09 — owner-scoped order detail + password endpoint auth.
 */
@WebMvcTest(controllers = MeController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtService.class})
class MeAccountWebTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @MockitoBean
    private AccountService accountService;

    @Test
    void myOrder_otherUsersOrder_returns404() throws Exception {
        when(orderService.findOrderByOrderNumberForUser("OS-OTHER", 7L))
                .thenThrow(new NotFoundException("Order not found: OS-OTHER"));

        mockMvc.perform(get("/api/me/orders/OS-OTHER").with(authentication(auth(7L))))
                .andExpect(status().isNotFound());
    }

    @Test
    void myOrder_ownOrder_returnsDetail() throws Exception {
        OrderDTO owned = sampleOrder("OS-MINE-1", "me@example.com");
        when(orderService.findOrderByOrderNumberForUser("OS-MINE-1", 7L)).thenReturn(owned);

        mockMvc.perform(get("/api/me/orders/OS-MINE-1").with(authentication(auth(7L))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value("OS-MINE-1"));
    }

    @Test
    void changePassword_wrongCurrent_returns400() throws Exception {
        doThrow(new IllegalArgumentException("Current password is incorrect"))
                .when(accountService)
                .changePassword(eq(7L), org.mockito.ArgumentMatchers.any());

        mockMvc.perform(post("/api/me/password")
                        .with(authentication(auth(7L)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"currentPassword":"wrong","newPassword":"newpassword1"}
                                """))
                .andExpect(status().isBadRequest());
    }

    private static UsernamePasswordAuthenticationToken auth(Long userId) {
        CustomerPrincipal principal = new CustomerPrincipal(userId, "me@example.com", "USER");
        return new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_USER")));
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
        dto.setShippingName("Alex");
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
