package com.yourstore.online_store_api.auth;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.yourstore.online_store_api.account.AddressDTO;
import com.yourstore.online_store_api.account.AccountService;
import com.yourstore.online_store_api.account.ChangePasswordRequest;
import com.yourstore.online_store_api.account.UpdateProfileRequest;
import com.yourstore.online_store_api.account.UpsertAddressRequest;
import com.yourstore.online_store_api.order.OrderDTO;
import com.yourstore.online_store_api.order.OrderService;

import jakarta.validation.Valid;

/**
 * Account-scoped endpoints under {@code /api/me/**} (guide 05 / 09).
 *
 * Unlike guest {@code /api/orders/**}, these always mean "the logged-in user".
 * SecurityConfig requires JWT ({@code .authenticated()}) for this path.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final OrderService orderService;
    private final AccountService accountService;

    MeController(OrderService orderService, AccountService accountService) {
        this.orderService = orderService;
        this.accountService = accountService;
    }

    /** GET /api/me — profile (preferred over /api/auth/me; both remain supported). */
    @GetMapping
    public ResponseEntity<MeDTO> me(@AuthenticationPrincipal CustomerPrincipal principal) {
        return ResponseEntity.ok(accountService.getProfile(principal.id()));
    }

    /** PATCH /api/me — update displayName only (email is read-only). */
    @PatchMapping
    public ResponseEntity<MeDTO> updateProfile(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(accountService.updateProfile(principal.id(), request));
    }

    /** POST /api/me/password — change password (requires current password). */
    @PostMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(principal.id(), request);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/me/orders — orders claimed / attached to this user (user_id = me).
     * Guest orders only appear after email verify + claim.
     */
    @GetMapping("/orders")
    public ResponseEntity<List<OrderDTO>> myOrders(@AuthenticationPrincipal CustomerPrincipal principal) {
        return ResponseEntity.ok(orderService.findOrdersByUserId(principal.id()));
    }

    /**
     * GET /api/me/orders/{orderNumber} — owner-scoped detail (404 if not yours).
     */
    @GetMapping("/orders/{orderNumber}")
    public ResponseEntity<OrderDTO> myOrder(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.findOrderByOrderNumberForUser(orderNumber, principal.id()));
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDTO>> listAddresses(
            @AuthenticationPrincipal CustomerPrincipal principal) {
        return ResponseEntity.ok(accountService.listAddresses(principal.id()));
    }

    @PostMapping("/addresses")
    public ResponseEntity<AddressDTO> createAddress(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @Valid @RequestBody UpsertAddressRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(accountService.createAddress(principal.id(), request));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<AddressDTO> updateAddress(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpsertAddressRequest request) {
        return ResponseEntity.ok(accountService.updateAddress(principal.id(), id, request));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @PathVariable Long id) {
        accountService.deleteAddress(principal.id(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/addresses/{id}/default")
    public ResponseEntity<AddressDTO> setDefaultAddress(
            @AuthenticationPrincipal CustomerPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(accountService.setDefaultAddress(principal.id(), id));
    }
}
