package com.yourstore.online_store_api.category;

import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.yourstore.common.PagedResponse;
import com.yourstore.online_store_api.product.ProductDTO;
import com.yourstore.online_store_api.product.ProductService;

/**
 * REST controller exposing public Category endpoints.
 * Controllers should remain thin and delegate to `CategoryService`.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductService productService;

    public CategoryController(CategoryService categoryService, ProductService productService) {
        this.categoryService = categoryService;
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> list(@RequestParam(defaultValue = "en") String locale) {
        List<CategoryDTO> categories = categoryService.findAll(locale);
        // Do not cache this list: admin create/edit/disable must show up on
        // the storefront immediately (Shop by Category + Collection menu).
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore().mustRevalidate())
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(categories);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<CategoryDTO> getBySlug(@PathVariable String slug,
                                                  @RequestParam(defaultValue = "en") String locale) {
        // Expanded forms of the line below:
        // 1) Using an explicit lambda instead of a method reference:
        //    return categoryService.findBySlug(slug)
        //            .map(dto -> ResponseEntity.ok(dto))
        //            .orElseGet(() -> ResponseEntity.notFound().build());
        // 2) Fully expanded without Optional helpers:
        //    Optional<CategoryDTO> maybe = categoryService.findBySlug(slug);
        //    if (maybe.isPresent()) {
        //        return ResponseEntity.ok(maybe.get());
        //    } else {
        //        return ResponseEntity.notFound().build();
        //    }
        return categoryService.findBySlug(slug, locale)
                // .map(dto -> ResponseEntity.ok(dto))
                // transform the result of findBySlug (which is an Optional<CategoryDTO>) into an Optional<ResponseEntity<CategoryDTO>>
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{slug}/products")
    public ResponseEntity<PagedResponse<ProductDTO>> listProducts(
        @PathVariable String slug,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "id,desc") String sort,
        @RequestParam(defaultValue = "en") String locale
    ) {
        try {
            PagedResponse<ProductDTO> response = productService.findProductsByCategorySlug(slug, page - 1, size, sort, locale); //front end page starts from 1
            // no cache here since product listings can change frequently (new products, price changes, stock levels, etc.).
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
