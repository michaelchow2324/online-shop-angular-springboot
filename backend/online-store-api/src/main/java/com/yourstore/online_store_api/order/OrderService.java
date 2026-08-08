package com.yourstore.online_store_api.order;

import java.util.List;

public interface OrderService {

   /** Guest checkout: {@code user_id} stays null; email from the request. */
   OrderDTO createPendingOrder(CreateOrderRequest req);

   /**
    * Create pending order, optionally attached to a logged-in customer (guide 05 step 6).
    * When {@code userId} is non-null, sets {@code user_id} and forces {@code accountEmail}
    * (ignores request email) so the order belongs to the account.
    */
   OrderDTO createPendingOrder(CreateOrderRequest req, Long userId, String accountEmail);

   /** Persist Stripe Checkout Session id after Session.create (guide 03). */
   void attachStripeCheckoutSession(String orderNumber, String stripeCheckoutSessionId);

   /**
    * Mark order paid from Stripe webhook (idempotent).
    * Looks up by checkout session id, then falls back to {@code orderNumber}.
    */
   void markPaidFromStripeCheckout(String stripeCheckoutSessionId, String stripePaymentIntentId, String orderNumber);

   OrderDTO findOrderById(Long id);
   OrderDTO findOrderByOrderNumber(String orderNumber);
   List<OrderDTO> findOrdersByUserId(Long userId);

   /** Admin list by status, newest first (guide 07). */
   List<OrderDTO> findOrdersByStatus(OrderStatus status);

   /**
    * Mark order shipped with carrier + tracking (guide 07).
    * Allowed from {@code PAID} or {@code FULFILLING}. Already-shipped with the same
    * tracking is idempotent; different tracking is rejected.
    */
   OrderDTO shipOrder(String orderNumber, ShipOrderRequest request);

}
