package com.yourstore.online_store_api.order;

import java.util.List;

public interface OrderService {

   OrderDTO createPendingOrder(CreateOrderRequest req);
   OrderDTO findOrderById(Long id);
   OrderDTO findOrderByOrderNumber(String orderNumber);
   List<OrderDTO> findOrdersByUserId(Long userId);

}
