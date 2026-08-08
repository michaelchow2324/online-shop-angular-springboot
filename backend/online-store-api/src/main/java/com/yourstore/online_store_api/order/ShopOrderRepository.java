package com.yourstore.online_store_api.order;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

    // find all orders for a user (newest first)
    List<ShopOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Admin fulfillment list (guide 07) — newest first. */
    List<ShopOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    
    Optional<ShopOrder> findByOrderNumber(String orderNumber);

    Optional<ShopOrder> findByOrderNumberAndUserId(String orderNumber, Long userId);

    Optional<ShopOrder> findByStripeCheckoutSessionId(String stripeCheckoutSessionId);

    boolean existsByOrderNumber(String orderNumber);

    // @Modifying means that this is a modifying query
    // clearAutomatically = true means clears the EntityManager cache, so the next query will get the latest data
    /** Attach guest orders (user_id null) with the same email to a verified account. */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE ShopOrder o
            SET o.userId = :userId
            WHERE o.userId IS NULL
              AND LOWER(o.email) = LOWER(:email)
            """)
    int claimGuestOrders(@Param("userId") Long userId, @Param("email") String email);

    /** Load order + line items for notification emails (items are LAZY). */
    @Query("""
            SELECT o FROM ShopOrder o
            LEFT JOIN FETCH o.items
            WHERE o.id = :id
            """)
    Optional<ShopOrder> findByIdWithItems(@Param("id") Long id);

    /**
     * Cancel abandoned checkouts (guide 08): only {@code PENDING_PAYMENT} older than
     * {@code cutoff}. Status predicate prevents cancelling paid orders.
     */
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE ShopOrder o
            SET o.status = :cancelled,
                o.updatedAt = :now
            WHERE o.status = :pending
              AND o.createdAt < :cutoff
            """)
    int cancelStalePendingPayments(
            @Param("pending") OrderStatus pending,
            @Param("cancelled") OrderStatus cancelled,
            @Param("cutoff") LocalDateTime cutoff,
            @Param("now") LocalDateTime now);
}
