package com.yourstore.online_store_api.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<MeDTO> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** ADMIN: after password, begin authenticator enrollment (returns Base32 secret). */
    @PostMapping("/mfa/setup/start")
    public ResponseEntity<MfaSetupResponse> startMfaSetup(@Valid @RequestBody MfaTokenRequest request) {
        return ResponseEntity.ok(authService.startMfaSetup(request.getMfaToken()));
    }

    /** ADMIN: confirm first TOTP code → enable MFA + full JWT. */
    @PostMapping("/mfa/setup/confirm")
    public ResponseEntity<AuthResponse> confirmMfaSetup(@Valid @RequestBody MfaCodeRequest request) {
        return ResponseEntity.ok(authService.confirmMfaSetup(request));
    }

    /** ADMIN: enter TOTP after password when MFA already enabled. */
    @PostMapping("/mfa/verify")
    public ResponseEntity<AuthResponse> verifyMfa(@Valid @RequestBody MfaCodeRequest request) {
        return ResponseEntity.ok(authService.verifyMfa(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<MeDTO> verifyEmail(@RequestParam("token") String token) {
        return ResponseEntity.ok(authService.verifyEmail(token));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(new MessageResponse(
                "If that email needs verification, we sent a new link. Check your inbox."));
    }

    @GetMapping("/me")
    public ResponseEntity<MeDTO> me(@AuthenticationPrincipal CustomerPrincipal principal) {
        return ResponseEntity.ok(authService.me(principal.id()));
    }
}
