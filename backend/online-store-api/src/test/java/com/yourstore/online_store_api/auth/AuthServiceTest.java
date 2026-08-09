package com.yourstore.online_store_api.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.yourstore.online_store_api.notification.MailService;
import com.yourstore.online_store_api.order.ShopOrderRepository;

/**
 * Guide 05 Step 8 — claim must not run until email is verified
 * (prevents account takeover of someone else's guest orders).
 * Login also requires verify (no session before email confirm).
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

    @Mock
    private MailService mailService;

    // note that injectmock only injects mock we declared with @mock. the dependencies will get null if we don't declare them with @mock.
    @InjectMocks // real AuthService with mock deps
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

    @Test
    void login_unverified_isRejected() {
        CustomerUser user = user(3L, "new@example.com", null);
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);

        LoginRequest req = new LoginRequest();
        req.setEmail("new@example.com");
        req.setPassword("secret");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("verify your email");
        verify(jwtService, never()).createToken(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void login_verified_returnsToken() {
        CustomerUser user = user(4L, "ok@example.com", LocalDateTime.now());
        when(userRepository.findByEmailIgnoreCase("ok@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "hash")).thenReturn(true);
        when(jwtService.createToken(user)).thenReturn("jwt-token");

        LoginRequest req = new LoginRequest();
        req.setEmail("ok@example.com");
        req.setPassword("secret");

        AuthResponse res = authService.login(req);

        assertThat(res.accessToken()).isEqualTo("jwt-token");
        assertThat(res.email()).isEqualTo("ok@example.com");
    }

    @Test
    void verifyEmail_usedToken_alreadyVerified_isIdempotent() {
        CustomerUser user = user(8L, "done@example.com", LocalDateTime.now());
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken("used-token");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsedAt(LocalDateTime.now().minusMinutes(1));
        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(token));

        MeDTO me = authService.verifyEmail("used-token");

        assertThat(me.email()).isEqualTo("done@example.com");
        assertThat(me.emailVerifiedAt()).isNotNull();
        verify(userRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void verifyEmail_usedToken_unverified_healsAndPersists() {
        CustomerUser user = user(9L, "stuck@example.com", null);
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken("used-unverified");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsedAt(LocalDateTime.now().minusMinutes(1));
        when(tokenRepository.findByToken("used-unverified")).thenReturn(Optional.of(token));
        when(userRepository.save(user)).thenReturn(user);

        MeDTO me = authService.verifyEmail("used-unverified");

        assertThat(me.emailVerifiedAt()).isNotNull();
        verify(userRepository).save(user);
        verify(orderRepository).claimGuestOrders(9L, "stuck@example.com");
    }

    @Test
    void resendVerification_unverified_createsTokenAndSendsMail() {
        CustomerUser user = user(5L, "new@example.com", null);
        when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.of(user));
        when(tokenRepository.findByUserAndUsedAtIsNull(user)).thenReturn(java.util.List.of());
        when(tokenRepository.save(org.mockito.ArgumentMatchers.any(EmailVerificationToken.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        authService.resendVerification("new@example.com");

        verify(tokenRepository).save(org.mockito.ArgumentMatchers.any(EmailVerificationToken.class));
        verify(mailService).sendVerifyEmail(
                org.mockito.ArgumentMatchers.eq("new@example.com"),
                org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void resendVerification_alreadyVerified_isNoOp() {
        CustomerUser user = user(6L, "done@example.com", LocalDateTime.now());
        when(userRepository.findByEmailIgnoreCase("done@example.com")).thenReturn(Optional.of(user));

        authService.resendVerification("done@example.com");

        verify(tokenRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(mailService, never()).sendVerifyEmail(anyString(), anyString());
    }

    @Test
    void resendVerification_unknownEmail_isNoOp() {
        when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

        authService.resendVerification("missing@example.com");

        verify(tokenRepository, never()).save(org.mockito.ArgumentMatchers.any());
        verify(mailService, never()).sendVerifyEmail(anyString(), anyString());
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
