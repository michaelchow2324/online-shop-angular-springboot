package com.yourstore.online_store_api.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "email_verification_token")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // foreign key to customer_user table
    // Spring Data JPA will automatically create the foreign key constraint in the database
    // optional = false means that the user must exist
    // fetch = FetchType.LAZY means that the user will be fetched lazily when needed
    // Spring will link CustomerUser using the user_id column automatically
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private CustomerUser user;

    @NotBlank
    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @NotNull
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    public boolean isUsed() {
        return usedAt != null;
    }

    public boolean isExpired(LocalDateTime now) {
        return expiresAt.isBefore(now);
    }
}
