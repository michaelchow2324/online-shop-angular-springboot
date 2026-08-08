package com.yourstore.online_store_api.admin;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.yourstore.online_store_api.auth.CustomerUser;
import com.yourstore.online_store_api.auth.CustomerUserRepository;

/**
 * Dev-only admin seed (guide 07 step 2).
 * Enabled when {@code app.admin.email} is set (see application-dev.properties + {@code spring.profiles.active=dev}).
 * Creates the user if missing; if present, refreshes password + ADMIN role so local credential changes apply.
 */
@Component
@ConditionalOnProperty(name = "app.admin.email")
public class AdminUserSeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeedRunner.class);
    private static final String ADMIN_ROLE = "ADMIN";

    private final CustomerUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;

    AdminUserSeedRunner(
            CustomerUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String email,
            @Value("${app.admin.password:}") String password) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email == null || email.isBlank()) {
            return;
        }
        if (password == null || password.isBlank()) {
            log.warn("app.admin.email is set but app.admin.password is blank — skipping admin seed");
            return;
        }

        String normalized = email.trim();
        CustomerUser admin = userRepository.findByEmailIgnoreCase(normalized).orElse(null);
        if (admin == null) {
            admin = new CustomerUser();
            admin.setEmail(normalized);
            admin.setCreatedAt(LocalDateTime.now());
            log.info("Seeding new ADMIN user {}", normalized);
        } else {
            log.info("Refreshing ADMIN credentials for {}", normalized);
        }

        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(ADMIN_ROLE);
        if (admin.getEmailVerifiedAt() == null) {
            admin.setEmailVerifiedAt(LocalDateTime.now());
        }
        userRepository.save(admin);
    }
}
