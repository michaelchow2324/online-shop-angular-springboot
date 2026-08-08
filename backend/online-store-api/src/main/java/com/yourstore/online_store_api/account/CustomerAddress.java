package com.yourstore.online_store_api.account;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "customer_address")
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank
    @Column(nullable = false, length = 64)
    private String label = "Home";

    @NotBlank
    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(length = 64)
    private String phone;

    @NotBlank
    @Column(nullable = false)
    private String line1;

    private String line2;

    @NotBlank
    @Column(nullable = false, length = 128)
    private String city;

    @NotBlank
    @Column(nullable = false, length = 8)
    private String province;

    @NotBlank
    @Column(nullable = false, length = 16)
    private String postal;

    @NotBlank
    @Column(nullable = false, length = 2)
    private String country = "CA";

    @Column(name = "is_default", nullable = false)
    private boolean defaultAddress = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
