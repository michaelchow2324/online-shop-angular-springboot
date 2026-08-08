package com.yourstore.online_store_api.account;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {

    List<CustomerAddress> findByUserIdOrderByDefaultAddressDescCreatedAtDesc(Long userId);

    Optional<CustomerAddress> findByIdAndUserId(Long id, Long userId);

    Optional<CustomerAddress> findByUserIdAndDefaultAddressTrue(Long userId);

    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE CustomerAddress a
            SET a.defaultAddress = false, a.updatedAt = CURRENT_TIMESTAMP
            WHERE a.userId = :userId
              AND a.defaultAddress = true
            """)
    int clearDefaultForUser(@Param("userId") Long userId);
}
