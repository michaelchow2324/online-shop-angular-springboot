package com.yourstore.online_store_api.order;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Thin controller: validate input, call service, return DTO.
 * Business errors are thrown from the service and mapped by {@code GlobalExceptionHandler}.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // @RequestBody: Spring will automatically deserialize the JSON request body into a CreateOrderRequest object
    // @Valid: Spring will automatically validate the request body using the constraints defined in the CreateOrderRequest class
    // if Spring finds that the fields deserialized from the request body does not match the fields defined in the CreateOrderRequest class, it will throw a MethodArgumentNotValidException
    // and GlobalExceptionHandler will handle it and return a 400 response with the validation errors
    @PostMapping
    public ResponseEntity<OrderDTO> create(@Valid @RequestBody CreateOrderRequest request) {
        OrderDTO created = orderService.createPendingOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderDTO> getByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.findOrderByOrderNumber(orderNumber));
    }
}
