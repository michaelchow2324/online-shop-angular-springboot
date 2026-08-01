package com.yourstore.online_store_api.order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.order.CreateOrderRequest.OrderItemRequest;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.shipping.ShippingQuoteDTO;
import com.yourstore.online_store_api.shipping.ShippingService;

@Service
public class OrderServiceImpl implements OrderService {

    private static final String DEFAULT_COUNTRY = "CA";
    private static final String DEFAULT_CURRENCY = "CAD";
    private static final String DEFAULT_SHIPPING_METHOD = "regular";

    private final ShopOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShippingService shippingService;

    OrderServiceImpl(ShopOrderRepository orderRepository, ProductRepository productRepository, ShippingService shippingService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.shippingService = shippingService;
    }

    @Override
    @Transactional // Default Propagation Level is REQUIRED (join the current transaction or create a new one)
    // other levels are: REQUIRED_NEW, SUPPORTS, NOT_SUPPORTED, NEVER, MANDATORY
    // REQUIRED_NEW: always create a new transaction
    // SUPPORTS: join the current transaction if it exists
    // NOT_SUPPORTED: do not join the current transaction
    // NEVER: do not create a new transaction
    // MANDATORY: join the current transaction, throw an exception if no transaction exists
    public OrderDTO createPendingOrder(CreateOrderRequest req) {
        // currently only supports Canada
        String normalizedCountry = (req.getShippingCountry() == null || req.getShippingCountry().isBlank())
                ? DEFAULT_COUNTRY
                : req.getShippingCountry().trim().toUpperCase();
        if (!DEFAULT_COUNTRY.equals(normalizedCountry)) {
            throw new IllegalArgumentException("Shipping country must be CA");
        }

        String normalizedProvince = req.getShippingProvince().trim().toUpperCase();

        ShopOrder order = new ShopOrder();
        order.setOrderNumber(generateUniqueOrderNumber());
        // leading/trailing space is trimmed
        order.setEmail(req.getEmail().trim());
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setCurrency(DEFAULT_CURRENCY);

        order.setShippingName(req.getShippingName());
        order.setShippingPhone(req.getShippingPhone());
        order.setShippingLine1(req.getShippingLine1());
        order.setShippingLine2(req.getShippingLine2());
        order.setShippingCity(req.getShippingCity());
        order.setShippingProvince(normalizedProvince);
        order.setShippingPostal(req.getShippingPostal().trim().toUpperCase());
        order.setShippingCountry(normalizedCountry);
        order.setShippingMethod(DEFAULT_SHIPPING_METHOD);

        // It builds a money value of 0.00 as a BigDecimal.
        // .setScale(2, ...) is used to set the scale of the BigDecimal to 2. (2 decimal places)
        // RoundingMode.HALF_UP is used to round the BigDecimal to the nearest integer.
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        for (OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + itemReq.getProductId()));
            if (!product.isActive()) {
                throw new IllegalArgumentException(
                        "Product is not active: " + itemReq.getProductId());
            }

            BigDecimal unitPrice = product.getPrice().setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = unitPrice
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            ShopOrderItem item = new ShopOrderItem();
            item.setProductId(product.getId());
            item.setSku(product.getSku());
            item.setProductName(product.getName());
            item.setUnitPrice(unitPrice);
            item.setQuantity(itemReq.getQuantity());
            item.setLineTotal(lineTotal);

            order.addItem(item);
            subtotal = subtotal.add(lineTotal);
        }

        // Guide 02: zone-based quote (do not take shippingFee from the client)
        ShippingQuoteDTO quoteDTO = shippingService.quote(normalizedCountry, normalizedProvince, subtotal);
        BigDecimal shippingFee = quoteDTO.getFee();
        order.setShippingZone(quoteDTO.getZone());
        order.setShippingMethod(quoteDTO.getMethod());

        BigDecimal tax = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(shippingFee).add(tax);

        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTax(tax);
        order.setTotal(total);

        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        ShopOrder saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Override
    public OrderDTO findOrderById(Long id) {
        throw new UnsupportedOperationException("Unimplemented method 'findOrderById'");
    }

    //how orderitem is loaded:
    // 1. orderRepository.findByOrderNumber(orderNumber) -> order is loaded
    // 2. order.getItems().size(); -> First use of items triggers load in the same transaction (SELECT * FROM shop_order_item WHERE order_id = ?)
    // Because of this field we declared in the Order Entity:
    // @OneToMany(mappedBy = "order", ...)
    // private List<ShopOrderItem> items;
    // Hibernate already knows: “items for this order = rows where order_id = order.id.”
    // When you call order.getItems(), it runs that query for you.


    // item → order
    // @ManyToOne(fetch = LAZY)
    // Explicitly lazy
    
    // order → items
    // @OneToMany(...)
    // Lazy by default (JPA/@OneToMany default is LAZY)
    // therefore, loading the order does not load line items yet. Hibernate loads them only when you first use the collection.
    // order.getItems().size() is a common “touch” to force that load while the @Transactional session is still open.
    // after touching , Hibernate loads the item from the db by running the query like this: SELECT * FROM shop_order_item WHERE order_id = ?
    // next time when we call order.getItems(), it will not run the query again, it will use the cached items

    @Override
    @Transactional(readOnly = true) //read only transaction, no changes to the database (advantage: better performance)
    public OrderDTO findOrderByOrderNumber(String orderNumber) {
        ShopOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderNumber));
        // touch items inside the transaction so mapping is safe with LAZY fetch
        order.getItems().size();
        return toDto(order);
    }

    @Override
    public List<OrderDTO> findOrdersByUserId(Long userId) {
        throw new UnsupportedOperationException("Unimplemented method 'findOrdersByUserId'");
    }

    private OrderDTO toDto(ShopOrder order) {
        // map the items to a list of OrderItemDTOs
        List<OrderItemDTO> itemDtos = order.getItems().stream()
                .map(item -> new OrderItemDTO(
                        item.getProductId(),
                        item.getSku(),
                        item.getProductName(),
                        item.getUnitPrice(),
                        item.getQuantity(),
                        item.getLineTotal()))
                .toList();

        return new OrderDTO(
                order.getOrderNumber(),
                order.getStatus(),
                order.getEmail(),
                order.getCurrency(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTax(),
                order.getTotal(),
                order.getShippingName(),
                order.getShippingPhone(),
                order.getShippingLine1(),
                order.getShippingLine2(),
                order.getShippingCity(),
                order.getShippingProvince(),
                order.getShippingPostal(),
                order.getShippingCountry(),
                order.getShippingZone(),
                order.getShippingMethod(),
                order.getCarrier(),
                order.getTrackingNumber(),
                order.getPaidAt(),
                order.getShippedAt(),
                order.getCreatedAt(),
                itemDtos);
    }

    /**
     * Format: OS-yyyyMMdd-XXXX (e.g. OS-20260728-A1B2).
     * Retries on the rare unique-constraint collision.
     */
    private String generateUniqueOrderNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // yyyyMMdd
        for (int attempt = 0; attempt < 5; attempt++) {
            int n = ThreadLocalRandom.current().nextInt(0x10000); // 0..65535
            String suffix = String.format("%04X", n);
            String candidate = "OS-" + date + "-" + suffix;
            if (!orderRepository.existsByOrderNumber(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not generate a unique order number");
    }
}
