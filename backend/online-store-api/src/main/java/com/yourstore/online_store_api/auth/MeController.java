package com.yourstore.online_store_api.auth;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;

/**
 * Account-scoped endpoints under {@code /api/me/**} (guide 05 / 09).
 *
 * Unlike guest {@code /api/orders/**}, these always mean "the logged-in user".
 * SecurityConfig requires JWT ({@code .authenticated()}) for this path.
 *
 * {@code @AuthenticationPrincipal} injects the {@link CustomerPrincipal} that
 * {@link JwtAuthenticationFilter} put into the SecurityContext.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final OrderService orderService;

    MeController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * GET /api/me/orders — orders claimed / attached to this user (user_id = me).
     * Guest orders only appear after email verify + claim.
     */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> myOrders(@AuthenticationPrincipal CustomerPrincipal principal) {
        return ResponseEntity.ok(orderService.findOrdersByUserId(principal.id()));
    }
}
