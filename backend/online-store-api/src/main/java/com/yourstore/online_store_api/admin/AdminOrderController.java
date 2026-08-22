package com.yourstore.online_store_api.admin;

import java.util.List;
import java.util.Locale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;
import com.yourstore.online_store_api.order.OrderStatus;
import com.yourstore.online_store_api.order.RefundOrderRequest;
import com.yourstore.online_store_api.order.ShipOrderRequest;

import jakarta.validation.Valid;

/**
 * Admin fulfillment APIs (guide 07). Secured by {@code /api/admin/** → hasRole("ADMIN")}.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** List orders by status (default {@code paid}), newest first. */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> list(
            @RequestParam(defaultValue = "paid") String status) {
        OrderStatus parsed = parseStatus(status);
        return ResponseEntity.ok(orderService.findOrdersByStatus(parsed));
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderDTO> getByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.findOrderByOrderNumber(orderNumber));
    }

    @PostMapping("/{orderNumber}/ship")
    public ResponseEntity<OrderDTO> ship(
            @PathVariable String orderNumber,
            @Valid @RequestBody ShipOrderRequest request) {
        return ResponseEntity.ok(orderService.shipOrder(orderNumber, request));
    }

    /** Full Stripe refund; marks order {@code REFUNDED}. Body optional. */
    @PostMapping("/{orderNumber}/refund")
    public ResponseEntity<OrderDTO> refund(
            @PathVariable String orderNumber,
            @RequestBody(required = false) RefundOrderRequest request) {
        RefundOrderRequest body = request != null ? request : new RefundOrderRequest();
        return ResponseEntity.ok(orderService.refundOrder(orderNumber, body));
    }

    private static OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return OrderStatus.PAID;
        }
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unknown order status: " + status);
        }
    }
}
