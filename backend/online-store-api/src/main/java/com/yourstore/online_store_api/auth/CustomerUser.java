package com.yourstore.online_store_api.auth;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "customer_user")
public class CustomerUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    /** Optional display name; email remains the login identity. */
    @Column(name = "display_name")
    private String displayName;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @NotBlank
    @Column(nullable = false, length = 32)
    private String role = "USER";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public boolean isEmailVerified() {
        return emailVerifiedAt != null;
    }
}
