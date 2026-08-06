package com.yourstore.online_store_api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yourstore.online_store_api.order.ShopOrderRepository;

/**
 * Guide 05 Step 8 — claim must not run until email is verified
 * (prevents account takeover of someone else's guest orders).
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CustomerUserRepository userRepository;

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    @Mock
    private ShopOrderRepository orderRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void claimGuestOrders_unverified_doesNotRun() {
        CustomerUser user = user(1L, "guest@example.com", null);

        int claimed = authService.claimGuestOrders(user);

        assertThat(claimed).isZero();
        verify(orderRepository, never()).claimGuestOrders(anyLong(), anyString());
    }

    @Test
    void claimGuestOrders_verified_attachesGuestOrdersByEmail() {
        CustomerUser user = user(7L, "Guest@Example.com", LocalDateTime.now());
        when(orderRepository.claimGuestOrders(7L, "Guest@Example.com")).thenReturn(2);

        int claimed = authService.claimGuestOrders(user);

        assertThat(claimed).isEqualTo(2);
        verify(orderRepository).claimGuestOrders(7L, "Guest@Example.com");
    }

    private static CustomerUser user(Long id, String email, LocalDateTime verifiedAt) {
        CustomerUser user = new CustomerUser();
        user.setId(id);
        user.setEmail(email);
        user.setPasswordHash("hash");
        user.setRole("USER");
        user.setEmailVerifiedAt(verifiedAt);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }
}
