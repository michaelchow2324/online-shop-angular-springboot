package com.yourstore.online_store_api.order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.notification.OrderPaidEvent;
import com.yourstore.online_store_api.notification.OrderShippedEvent;
import com.yourstore.online_store_api.order.CreateOrderRequest.OrderItemRequest;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.shipping.ShippingQuoteDTO;
import com.yourstore.online_store_api.shipping.ShippingService;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.tax.TaxQuote;
import com.yourstore.online_store_api.tax.TaxService;

@Service
public class OrderServiceImpl implements OrderService {

    private static final String DEFAULT_COUNTRY = "CA";
    private static final String DEFAULT_CURRENCY = "CAD";
    private static final String DEFAULT_SHIPPING_METHOD = "regular";

    private final ShopOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final MediaRepository mediaRepository;
    private final ImageStorageService imageStorageService;
    private final ShippingService shippingService;
    private final TaxService taxService;
    private final ApplicationEventPublisher eventPublisher;

    OrderServiceImpl(
            ShopOrderRepository orderRepository,
            ProductRepository productRepository,
            MediaRepository mediaRepository,
            ImageStorageService imageStorageService,
            ShippingService shippingService,
            TaxService taxService,
            ApplicationEventPublisher eventPublisher) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.mediaRepository = mediaRepository;
        this.imageStorageService = imageStorageService;
        this.shippingService = shippingService;
        this.taxService = taxService;
        this.eventPublisher = eventPublisher;
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
        return createPendingOrder(req, null, null);
    }

    @Override
    @Transactional
    public OrderDTO createPendingOrder(CreateOrderRequest req, Long userId, String accountEmail) {
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

        // Logged-in (JWT): attach user_id and force account email.
        // Guest: user_id null, email from the checkout form.
        if (userId != null) {
            if (accountEmail == null || accountEmail.isBlank()) {
                throw new IllegalArgumentException("Account email is required when attaching a user");
            }
            order.setUserId(userId);
            order.setEmail(accountEmail.trim());
        } else {
            order.setEmail(req.getEmail().trim());
        }

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

        // Guide 08: destination GST/HST on (subtotal + shipping); snapshot rate on the order
        TaxQuote taxQuote = taxService.quote(normalizedProvince, subtotal, shippingFee);
        BigDecimal tax = taxQuote.amount();
        BigDecimal total = subtotal.add(shippingFee).add(tax);

        order.setSubtotal(subtotal);
        order.setShippingFee(shippingFee);
        order.setTax(tax);
        order.setTaxRate(taxQuote.rate());
        order.setTaxName(taxQuote.name());
        order.setTotal(total);

        LocalDateTime now = LocalDateTime.now();
        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        ShopOrder saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void attachStripeCheckoutSession(String orderNumber, String stripeCheckoutSessionId) {
        ShopOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderNumber));
        order.setStripeCheckoutSessionId(stripeCheckoutSessionId);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void markPaidFromStripeCheckout(
            String stripeCheckoutSessionId,
            String stripePaymentIntentId,
            String orderNumber) {
        ShopOrder order = orderRepository.findByStripeCheckoutSessionId(stripeCheckoutSessionId)
                .or(() -> {
                    if (orderNumber == null || orderNumber.isBlank()) {
                        return Optional.empty();
                    }
                    return orderRepository.findByOrderNumber(orderNumber);
                })
                .orElseThrow(() -> new NotFoundException(
                        "Order not found for Stripe session: " + stripeCheckoutSessionId));

        // Idempotent: webhook retries / CLI resend must not fail or double-process
        if (order.getStatus() == OrderStatus.PAID) {
            return;
        }
        // Late webhook after pending expiry may find CANCELLED — still mark PAID
        // (customer completed Stripe; don't leave money without an order).

        LocalDateTime now = LocalDateTime.now();
        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(now);
        order.setStripePaymentIntentId(stripePaymentIntentId);
        if (order.getStripeCheckoutSessionId() == null) {
            order.setStripeCheckoutSessionId(stripeCheckoutSessionId);
        }
        order.setUpdatedAt(now);
        orderRepository.save(order);

        // Publish inside this @Transactional method so @TransactionalEventListener(AFTER_COMMIT)
        // runs only after PAID is durable (guide 06). Do not send email here.
        eventPublisher.publishEvent(new OrderPaidEvent(order.getId()));
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
    @Transactional(readOnly = true)
    public List<OrderDTO> findOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(order -> {
                    order.getItems().size(); // touch items inside the transaction so mapping is safe with LAZY fetch
                    return toDto(order);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> findOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                .map(order -> {
                    order.getItems().size();
                    return toDto(order);
                })
                .toList();
    }

    @Override
    @Transactional
    public OrderDTO shipOrder(String orderNumber, ShipOrderRequest request) {
        ShopOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new NotFoundException("Order not found: " + orderNumber));

        String carrier = request.getCarrier().trim();
        String tracking = request.getTrackingNumber().trim();
        if (!isSupportedCarrier(carrier)) {
            throw new IllegalArgumentException(
                    "Unsupported carrier '" + carrier + "'. Use canada_post.");
        }

        // Idempotent: already shipped with the same tracking → return current state
        if (order.getStatus() == OrderStatus.SHIPPED) {
            if (trackingEquals(order.getTrackingNumber(), tracking)
                    && carrierEquals(order.getCarrier(), carrier)) {
                order.getItems().size();
                return toDto(order);
            }
            throw new IllegalArgumentException(
                    "Order already shipped with different tracking: " + orderNumber);
        }

        if (order.getStatus() != OrderStatus.PAID && order.getStatus() != OrderStatus.FULFILLING) {
            throw new IllegalArgumentException(
                    "Order must be paid or fulfilling to ship (current: " + order.getStatus() + ")");
        }

        LocalDateTime now = LocalDateTime.now();
        order.setCarrier(carrier);
        order.setTrackingNumber(tracking);
        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(now);
        order.setUpdatedAt(now);
        orderRepository.save(order);

        // AFTER_COMMIT listener sends shipped email (guide 06 / 07)
        eventPublisher.publishEvent(new OrderShippedEvent(order.getId()));

        order.getItems().size();
        return toDto(order);
    }

    @Override
    @Transactional
    public int cancelExpiredPendingPayments(LocalDateTime cutoff) {
        if (cutoff == null) {
            throw new IllegalArgumentException("Cutoff is required");
        }
        LocalDateTime now = LocalDateTime.now();
        return orderRepository.cancelStalePendingPayments(
                OrderStatus.PENDING_PAYMENT,
                OrderStatus.CANCELLED,
                cutoff,
                now);
    }

    private static boolean trackingEquals(String existing, String incoming) {
        if (existing == null || existing.isBlank()) {
            return false;
        }
        return existing.trim().equalsIgnoreCase(incoming);
    }

    private static boolean isSupportedCarrier(String carrier) {
        String normalized = carrier.trim().toLowerCase(Locale.ROOT);
        return normalized.equals("canada_post")
                || normalized.equals("canadapost")
                || normalized.equals("canada-post");
    }

    private static boolean carrierEquals(String existing, String incoming) {
        if (existing == null || existing.isBlank()) {
            return false;
        }
        return existing.trim().equalsIgnoreCase(incoming);
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
                        item.getLineTotal(),
                        resolveLiveImageUrl(item.getProductId())))
                .toList();

        return new OrderDTO(
                order.getOrderNumber(),
                order.getStatus(),
                order.getEmail(),
                order.getCurrency(),
                order.getSubtotal(),
                order.getShippingFee(),
                order.getTax(),
                order.getTaxRate(),
                order.getTaxName(),
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
     * Live catalog image for order line display (not snapshotted on the order row).
     * Returns null if the product or media is gone — UI should show a placeholder.
     *
     * Why two lookups (same idea as ProductServiceImpl.resolvePrimaryImage)?
     *
     * 1) {@code product.image_media_id} — fast path: seeded/chosen primary thumbnail id on the
     *    product row. One PK lookup on {@code media}.
     *
     * 2) Query {@code media} by entity_type=product + entity_id — fallback when image_media_id
     *    is null, or that media row was deleted. Uses is_primary ordering so we still get a
     *    sensible thumbnail from whatever images remain.
     *
     * Not two different “image systems” — just preferred pointer, then gallery fallback.
     */
    private String resolveLiveImageUrl(Long productId) {
        if (productId == null) {
            return null;
        }
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return null;
        }
        Product product = productOpt.get();

        // 1) Preferred: denormalized primary media id on product table
        if (product.getImageMediaId() != null) {
            Media media = mediaRepository.findById(product.getImageMediaId()).orElse(null);
            if (media != null) {
                return imageStorageService.publicUrl(media.getStorageKey());
            }
            // image_media_id pointed at a missing row — fall through to gallery query
        }

        // 2) Fallback: any media linked to this product (primary first)
        return mediaRepository
                .findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", productId)
                .stream()
                .findFirst()
                .map(media -> imageStorageService.publicUrl(media.getStorageKey()))
                .orElse(null);
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
