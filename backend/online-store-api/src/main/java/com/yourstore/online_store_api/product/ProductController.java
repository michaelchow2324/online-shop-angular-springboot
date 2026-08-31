package com.yourstore.online_store_api.product;

import java.util.concurrent.TimeUnit;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.yourstore.common.PagedResponse;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<ProductDTO>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id,desc") String sort,
        @RequestParam(defaultValue = "en") String locale
    ) {
        PagedResponse<ProductDTO> response = productService.findProducts(page, size, sort, locale);
        
        // no cache here since product listings can change frequently (new products, price changes, stock levels, etc.).
        return ResponseEntity.ok(response);
    }

    /**
     * Homepage New Arrivals: newest active products by created date.
     * Default 10 — typical boutique homepage rails are 8–12 items.
     */
    @GetMapping("/new-arrivals")
    public ResponseEntity<PagedResponse<ProductDTO>> newArrivals(
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(defaultValue = "en") String locale
    ) {
        return ResponseEntity.ok(productService.findNewArrivals(limit, locale));
    }   

    @GetMapping("/{slug}/details")
    public ResponseEntity<ProductDetailDTO> getBySlug(
        @PathVariable String slug,
        @RequestParam(defaultValue = "en") String locale
    ) {
        try {
            ProductDetailDTO response = productService.findProductBySlug(slug, locale);
            // no cache here since product listings can change frequently (new products, price changes, stock levels, etc.).
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
