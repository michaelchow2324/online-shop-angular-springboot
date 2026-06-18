package com.yourstore.online_store_api.product;


import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.yourstore.common.PagedResponse;
import com.yourstore.online_store_api.category.CategoryDTO;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.product.ProductDTO.ProductImage;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.translation.ProductTranslation;
import com.yourstore.online_store_api.translation.ProductTranslationRepository;

@Service
public class ProductServiceImpl implements ProductService {

    // default values for pagination and sorting.
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;
    private static final String DEFAULT_SORT = "id,desc";


    private final ProductRepository productRepository;
    private final MediaRepository mediaRepository;
    private final ImageStorageService storageService;
    private final CategoryRepository categoryRepository;
    private final ProductTranslationRepository translationRepository;

    ProductServiceImpl(ProductRepository productRepository, MediaRepository mediaRepository, ImageStorageService storageService,
                       CategoryRepository categoryRepository, ProductTranslationRepository translationRepository) {
        this.productRepository = productRepository;
        this.mediaRepository = mediaRepository;
        this.storageService = storageService;
        this.categoryRepository = categoryRepository;
        this.translationRepository = translationRepository;
    }

    @Override
    public PagedResponse<ProductDTO> findProducts(int page, int size, String sort, String locale) {

        // prevent negative page
        int normalizedPage = Math.max(page, DEFAULT_PAGE);

        //prevent <=0 size and enforce max size limit
        int normalizedSize = normalizeSize(size);

        Sort normalizedSort = parseSort(sort);
        String normalizedLocale = normalizeLocale(locale);

        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, normalizedSort);
        Page<Product> productsPage = productRepository.findByActiveTrue(pageable);

        //check categoryserviceimpl for stream pipeline explanation
        List<ProductDTO> dtos = productsPage.getContent()
        .stream()
        .map(product -> toDto(product, normalizedLocale))
        .collect(Collectors.toList());
        

        return new PagedResponse<>(dtos, page, size, 
        productsPage.getTotalElements(), productsPage.getTotalPages(),
        productsPage.hasNext(), productsPage.hasPrevious());
    }

    @Override
    public PagedResponse<ProductDTO> findProductsByCategorySlug(String slug, int page, int size, String sort, String locale) {
        
        // Validate slug
        if (slug == null || slug.trim().isEmpty()) {
            throw new IllegalArgumentException("Category slug cannot be empty");
        }

        String normalizedSlug = slug.trim();

        // Verify category exists
        if (categoryRepository.findBySlug(normalizedSlug).isEmpty()) {
            throw new IllegalArgumentException("Category not found: " + normalizedSlug);
        }

        // prevent negative page
        int normalizedPage = Math.max(page, DEFAULT_PAGE);

        //prevent <=0 size and enforce max size limit
        int normalizedSize = normalizeSize(size);

        Sort normalizedSort = parseSort(sort);
        String normalizedLocale = normalizeLocale(locale);

        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize, normalizedSort);
        Page<Product> productsPage = productRepository.findByCategoriesSlugAndActiveTrue(normalizedSlug, pageable);

        //check categoryserviceimpl for stream pipeline explanation
        List<ProductDTO> dtos = productsPage.getContent()
        .stream()
        .map(product -> toDto(product, normalizedLocale))
        .collect(Collectors.toList());

        return new PagedResponse<>(dtos, normalizedPage, normalizedSize, 
        productsPage.getTotalElements(), productsPage.getTotalPages(),
        productsPage.hasNext(), productsPage.hasPrevious());

    }

    @Override
    public ProductDetailDTO findProductBySlug(String slug, String locale) {

        // Validate slug
        if (slug == null || slug.trim().isEmpty()) {
            throw new IllegalArgumentException("Product slug cannot be empty");
        }

        String normalizedSlug = slug.trim();

        String normalizedLocale = normalizeLocale(locale);

        ProductDetailDTO dto = productRepository.findBySlugAndActiveTrue(normalizedSlug)
            .map(product -> toDetailDto(product, normalizedLocale))
            .orElseThrow(() -> new IllegalArgumentException("Product not found or not active: " + normalizedSlug));

        return dto;
    } 
    
    private int normalizeSize(int size) {
        if (size <= 0) {
            return DEFAULT_SIZE;
        }
        return Math.min(size, MAX_SIZE);
    }

    // sort parameter format: "field,direction" e.g. "price,asc" or "name,desc". If direction is missing, default to desc.
    private Sort parseSort(String sort) {
        String value = (sort == null || sort.isBlank()) ? DEFAULT_SORT : sort;
        String[] parts = value.split(",");

        String field = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase() : "desc";

        Sort.Direction sortDirection =
            "asc".equals(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;

        return Sort.by(sortDirection, field);
    }


    /**
     * Map a `Product` entity to a `ProductDTO`, resolving the image URL
     * from the `media` table and the configured storage service.
     */
    private ProductDTO toDto(Product p, String locale) {
        // Resolve the image URL from the media table via the storage service
        ProductDTO.ProductImage productImage = null;
        if (p.getImageMediaId() != null) {
            Media m = mediaRepository.findById(p.getImageMediaId()).orElse(null);
            if (m != null) {
                // Wrap the URL in a nested object matching the frontend's IAttachment interface:
                // { original_url: "http://..." } — read by the template as category_image.original_url
                productImage = new ProductDTO.ProductImage(storageService.publicUrl(m.getStorageKey()));
            }
        }
        ProductTranslation translation = translationRepository.findByProductIdAndLocale(p.getId(), locale)
                .orElse(null);

        String translatedName = translation != null && translation.getName() != null ? translation.getName() : p.getName();
        String translatedDescription = translation != null && translation.getDescription() != null ? translation.getDescription() : p.getDescription();

        // `active` maps to `status` to align with the frontend's ICategory.status field
        return new ProductDTO(p.getId(), translatedName, p.getSlug(), p.getSku(), translatedDescription, p.getPrice(), productImage, p.isActive());
    }

    private ProductDetailDTO toDetailDto(Product p, String locale) {
        ProductDTO.ProductImage productImage = null;
        if (p.getImageMediaId() != null) {
            Media m = mediaRepository.findById(p.getImageMediaId()).orElse(null);
            if (m != null) {
                // Wrap the URL in a nested object matching the frontend's IAttachment interface:
                // { original_url: "http://..." } — read by the template as category_image.original_url
                productImage = new ProductDTO.ProductImage(storageService.publicUrl(m.getStorageKey()));
            }
        }

        ProductTranslation translation = translationRepository.findByProductIdAndLocale(p.getId(), locale)
                .orElse(null);

        String translatedName = translation != null && translation.getName() != null ? translation.getName() : p.getName();
        String translatedDescription = translation != null && translation.getDescription() != null ? translation.getDescription() : p.getDescription();

        return new ProductDetailDTO(p.getId(), translatedName, p.getSlug(), translatedDescription, p.getPrice(), p.getPrice(), false, null, productImage, null, null, 0, p.getSku(), null, null, null, p.isActive());
    }

    private String normalizeLocale(String locale) {
        if (locale == null || locale.isBlank()) {
            return "en";
        }
        return "zh".equalsIgnoreCase(locale) ? "zh-TW" : locale;
    }

}
