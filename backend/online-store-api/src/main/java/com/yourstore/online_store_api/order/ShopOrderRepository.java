package com.yourstore.online_store_api.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

    // find all orders for a user
    Optional<List<ShopOrder>> findByUserId(Long userId);
    
    Optional<ShopOrder> findByOrderNumber(String orderNumber);

    Optional<ShopOrder> findByStripeCheckoutSessionId(String stripeCheckoutSessionId);

    boolean existsByOrderNumber(String orderNumber);
}
