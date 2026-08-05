package com.yourstore.online_store_api.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerUserRepository extends JpaRepository<CustomerUser, Long> {

    Optional<CustomerUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
