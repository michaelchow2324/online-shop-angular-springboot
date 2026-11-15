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
    private final TotpService totpService;

    AuthService(
            CustomerUserRepository userRepository,
            EmailVerificationTokenRepository tokenRepository,
            ShopOrderRepository orderRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            MailService mailService,
            TotpService totpService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.totpService = totpService;
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
        user.setPhone(req.getPhone().trim());
        user.setCountryCode("1"); // Canada-only dial for now
        user.setRole(DEFAULT_ROLE);
        user.setCreatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        String rawToken = createVerificationToken(user);
        sendVerifyEmailSafely(email, rawToken);

        return toMeDTO(user);
    }

    /**
     * Validates credentials.
     * USERs get a full JWT. ADMINs always go through MFA (setup or challenge).
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        CustomerUser user = userRepository.findByEmailIgnoreCase(req.getEmail().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException(
                    "Please verify your email before signing in. Check your inbox for the link.");
        }

        if (user.isAdmin()) {
            if (user.isMfaEnabled() && user.getMfaSecret() != null && !user.getMfaSecret().isBlank()) {
                String mfaToken = jwtService.createMfaToken(user, JwtService.PURPOSE_MFA_CHALLENGE);
                return AuthResponse.mfaChallenge(user.getEmail(), user.getRole(), mfaToken);
            }
            String mfaToken = jwtService.createMfaToken(user, JwtService.PURPOSE_MFA_SETUP);
            return AuthResponse.mfaSetup(user.getEmail(), user.getRole(), mfaToken);
        }

        String accessToken = jwtService.createToken(user);
        return AuthResponse.fullAccess(accessToken, user.getEmail(), user.getRole());
    }

    /**
     * ADMIN: create (or rotate) a TOTP secret after password login. MFA not enabled until confirm.
     */
    @Transactional
    public MfaSetupResponse startMfaSetup(String mfaToken) {
        CustomerUser user = requireAdminFromMfaToken(mfaToken, JwtService.PURPOSE_MFA_SETUP);
        if (user.isMfaEnabled()) {
            throw new IllegalArgumentException("MFA is already enabled. Sign in and enter your authenticator code.");
        }

        String secret = totpService.generateSecret();
        user.setMfaSecret(secret);
        user.setMfaEnabled(false);
        userRepository.save(user);

        return new MfaSetupResponse(secret, totpService.otpAuthUrl(user.getEmail(), secret), user.getEmail());
    }

    /**
     * ADMIN: verify first authenticator code and enable MFA; return full access JWT.
     */
    @Transactional
    public AuthResponse confirmMfaSetup(MfaCodeRequest req) {
        CustomerUser user = requireAdminFromMfaToken(req.getMfaToken(), JwtService.PURPOSE_MFA_SETUP);
        if (user.getMfaSecret() == null || user.getMfaSecret().isBlank()) {
            throw new IllegalArgumentException("Start MFA setup first.");
        }
        if (!totpService.verify(user.getMfaSecret(), req.getCode())) {
            throw new IllegalArgumentException("Invalid authenticator code");
        }

        user.setMfaEnabled(true);
        userRepository.save(user);

        String accessToken = jwtService.createToken(user);
        return AuthResponse.fullAccess(accessToken, user.getEmail(), user.getRole());
    }

    /**
     * ADMIN: verify TOTP after password; return full access JWT.
     */
    @Transactional(readOnly = true)
    public AuthResponse verifyMfa(MfaCodeRequest req) {
        CustomerUser user = requireAdminFromMfaToken(req.getMfaToken(), JwtService.PURPOSE_MFA_CHALLENGE);
        if (!user.isMfaEnabled() || user.getMfaSecret() == null || user.getMfaSecret().isBlank()) {
            throw new IllegalArgumentException("MFA is not enabled for this account. Sign in again to set it up.");
        }
        if (!totpService.verify(user.getMfaSecret(), req.getCode())) {
            throw new IllegalArgumentException("Invalid authenticator code");
        }

        String accessToken = jwtService.createToken(user);
        return AuthResponse.fullAccess(accessToken, user.getEmail(), user.getRole());
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
        CustomerUser user = token.getUser();

        if (token.isUsed()) {
            if (user.isEmailVerified()) {
                return toMeDTO(user);
            }
            user.setEmailVerifiedAt(now);
            userRepository.save(user);
            claimGuestOrders(user);
            return toMeDTO(user);
        }
        if (token.isExpired(now)) {
            throw new IllegalArgumentException("Verification token expired");
        }

        user.setEmailVerifiedAt(now);
        token.setUsedAt(now);
        userRepository.save(user);
        tokenRepository.save(token);

        claimGuestOrders(user);

        return toMeDTO(user);
    }

    @Transactional
    public void resendVerification(String emailRaw) {
        if (emailRaw == null || emailRaw.isBlank()) {
            return;
        }
        String email = emailRaw.trim();
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (user.isEmailVerified()) {
                return;
            }
            invalidateUnusedTokens(user);
            String rawToken = createVerificationToken(user);
            sendVerifyEmailSafely(user.getEmail(), rawToken);
        });
    }

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
                user.getDisplayName(),
                user.getPhone(),
                user.getCountryCode(),
                user.getRole(),
                user.getEmailVerifiedAt());
    }

    private CustomerUser requireAdminFromMfaToken(String mfaToken, String purpose) {
        CustomerPrincipal principal = jwtService.parseMfaToken(mfaToken, purpose);
        CustomerUser user = userRepository.findById(principal.id())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired MFA session. Sign in again."));
        if (!user.isAdmin()) {
            throw new IllegalArgumentException("MFA is only required for admin accounts");
        }
        return user;
    }

    private String createVerificationToken(CustomerUser user) {
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setExpiresAt(LocalDateTime.now().plusHours(VERIFY_TOKEN_HOURS));
        tokenRepository.save(token);
        return token.getToken();
    }

    private void invalidateUnusedTokens(CustomerUser user) {
        LocalDateTime now = LocalDateTime.now();
        for (EmailVerificationToken token : tokenRepository.findByUserAndUsedAtIsNull(user)) {
            token.setUsedAt(now);
        }
    }

    private void sendVerifyEmailSafely(String email, String rawToken) {
        try {
            mailService.sendVerifyEmail(email, rawToken);
        } catch (Exception ex) {
            log.error("Failed to send verify-email to {}: {}", email, ex.getMessage());
            log.debug("Verify link token for {} (mail failed): {}", email, rawToken);
        }
    }
}
