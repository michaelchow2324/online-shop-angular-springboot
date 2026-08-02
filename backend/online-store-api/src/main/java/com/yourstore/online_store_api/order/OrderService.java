package com.yourstore.online_store_api.order;

import java.util.List;

public interface OrderService {

   OrderDTO createPendingOrder(CreateOrderRequest req);

   /** Persist Stripe Checkout Session id after Session.create (guide 03). */
   void attachStripeCheckoutSession(String orderNumber, String stripeCheckoutSessionId);

   OrderDTO findOrderById(Long id);
   OrderDTO findOrderByOrderNumber(String orderNumber);
   List<OrderDTO> findOrdersByUserId(Long userId);

}
