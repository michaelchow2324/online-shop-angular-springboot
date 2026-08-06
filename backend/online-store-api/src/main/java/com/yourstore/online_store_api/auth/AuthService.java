package com.yourstore.online_store_api.auth;

import java.time.LocalDateTime;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.notification.MailService;
import com.yourstore.online_store_api.order.ShopOrderRepository;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String DEFAULT_ROLE = "USER";
    private static final int VERIFY_TOKEN_HOURS = 24;

    private final CustomerUserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final ShopOrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;

    AuthService(
            CustomerUserRepository userRepository,
            EmailVerificationTokenRepository tokenRepository,
            ShopOrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MailService mailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    @Transactional
    public MeDTO register(RegisterRequest req) {
        String email = req.getEmail().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        CustomerUser user = new CustomerUser();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(DEFAULT_ROLE);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        String rawToken = createVerificationToken(user);
        sendVerifyEmailSafely(email, rawToken);

        return toMeDTO(user);
    }

    /**
     * Validates credentials and returns a JWT access token.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        CustomerUser user = userRepository.findByEmailIgnoreCase(req.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String accessToken = jwtService.createToken(user);
        return new AuthResponse(accessToken, user.getEmail(), user.getRole());
    }

    @Transactional(readOnly = true)
    public MeDTO me(Long userId) {
        CustomerUser user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return toMeDTO(user);
    }

    @Transactional
    public MeDTO verifyEmail(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Verification token is required");
        }

        EmailVerificationToken token = tokenRepository.findByToken(rawToken.trim())
                .orElseThrow(() -> new NotFoundException("Invalid verification token"));

        LocalDateTime now = LocalDateTime.now();
        if (token.isUsed()) {
            throw new IllegalArgumentException("Verification token already used");
        }
        if (token.isExpired(now)) {
            throw new IllegalArgumentException("Verification token expired");
        }

        CustomerUser user = token.getUser();
        user.setEmailVerifiedAt(now);
        token.setUsedAt(now);

        claimGuestOrders(user);

        return toMeDTO(user);
    }

    /**
     * Attaches past guest orders (same email, user_id null) to the account.
     * No-op when email is not verified — prevents account takeover.
     */
    @Transactional
    public int claimGuestOrders(CustomerUser user) {
        if (!user.isEmailVerified()) {
            return 0;
        }
        return orderRepository.claimGuestOrders(user.getId(), user.getEmail());
    }

    public MeDTO toMeDTO(CustomerUser user) {
        return new MeDTO(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getEmailVerifiedAt());
    }

    private String createVerificationToken(CustomerUser user) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setExpiresAt(LocalDateTime.now().plusHours(VERIFY_TOKEN_HOURS));
        tokenRepository.save(token);
        return token.getToken();
    }

    /**
     * Mail failure must not roll back registration (account is already saved).
     * User can request a resend later; link is logged at debug for local troubleshooting.
     */
    private void sendVerifyEmailSafely(String email, String rawToken) {
        try {
            mailService.sendVerifyEmail(email, rawToken);
        } catch (Exception ex) {
            log.error("Failed to send verify-email to {}: {}", email, ex.getMessage());
            log.debug("Verify link token for {} (mail failed): {}", email, rawToken);
        }
    }
}
