package com.yourstore.online_store_api.admin.product;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.yourstore.common.NotFoundException;
import com.yourstore.common.PagedResponse;
import com.yourstore.online_store_api.admin.product.AdminProductDTO.AdminCategoryRef;
import com.yourstore.online_store_api.admin.product.AdminProductDTO.AdminProductImage;
import com.yourstore.online_store_api.category.Category;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductDTO.ProductImage;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.translation.ProductTranslation;
import com.yourstore.online_store_api.translation.ProductTranslationRepository;

@Service
public class AdminProductServiceImpl implements AdminProductService {

    private static final String ENTITY_TYPE = "product";
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MediaRepository mediaRepository;
    private final ImageStorageService storageService;
    private final ProductTranslationRepository translationRepository;

    AdminProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            MediaRepository mediaRepository,
            ImageStorageService storageService,
            ProductTranslationRepository translationRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.mediaRepository = mediaRepository;
        this.storageService = storageService;
        this.translationRepository = translationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminProductDTO> list(int page, int size, String q, Boolean active) {
        int normalizedPage = Math.max(page, DEFAULT_PAGE);
        int normalizedSize = size <= 0 ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        String query = q == null || q.isBlank() ? null : q.trim();
        Pageable pageable = PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        // Blank search must not bind a null LIKE parameter (Postgres LOWER(bytea)).
        Page<Product> productsPage = query == null
                ? productRepository.listFiltered(active, pageable)
                : productRepository.searchByText(query, active, pageable);
        List<AdminProductDTO> dtos = productsPage.getContent().stream()
                .map(p -> toDto(p, false))
                .collect(Collectors.toList());
        return new PagedResponse<>(
                dtos,
                normalizedPage,
                normalizedSize,
                productsPage.getTotalElements(),
                productsPage.getTotalPages(),
                productsPage.hasNext(),
                productsPage.hasPrevious());
    }

    @Override
    @Transactional(readOnly = true)
    public String exportCatalogCsv() {
        List<Product> products = productRepository.findAllWithCategories().stream()
                .sorted(Comparator.comparing(Product::getId, Comparator.nullsLast(Long::compareTo)))
                .toList();
        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF');
        csv.append("id,sku,slug,name,name_en,name_zh,description,description_en,description_zh,");
        csv.append("price,active,categories,image_keys,image_files,primary_image_key,created_at,updated_at\n");
        for (Product product : products) {
            ProductTranslation en = translationRepository.findByProductIdAndLocale(product.getId(), "en")
                    .orElse(null);
            ProductTranslation zh = translationRepository.findByProductIdAndLocale(product.getId(), "zh-TW")
                    .orElseGet(() -> translationRepository.findByProductIdAndLocale(product.getId(), "zh")
                            .orElse(null));
            List<Media> gallery = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                    ENTITY_TYPE, product.getId());
            String categories = product.getCategories().stream()
                    .map(Category::getSlug)
                    .sorted()
                    .collect(Collectors.joining(","));
            String imageKeys = gallery.stream()
                    .map(Media::getStorageKey)
                    .collect(Collectors.joining(","));
            String imageFiles = gallery.stream()
                    .map(media -> CatalogCsv.basename(media.getStorageKey()))
                    .collect(Collectors.joining(","));
            String primaryKey = gallery.stream()
                    .filter(Media::isPrimary)
                    .map(Media::getStorageKey)
                    .findFirst()
                    .orElseGet(() -> {
                        if (product.getImageMediaId() == null) {
                            return "";
                        }
                        return mediaRepository.findById(product.getImageMediaId())
                                .map(Media::getStorageKey)
                                .orElse("");
                    });
            csv.append(csvCell(product.getId()))
                    .append(',').append(csvCell(product.getSku()))
                    .append(',').append(csvCell(product.getSlug()))
                    .append(',').append(csvCell(product.getName()))
                    .append(',').append(csvCell(en != null ? en.getName() : product.getName()))
                    .append(',').append(csvCell(zh != null ? zh.getName() : null))
                    .append(',').append(csvCell(product.getDescription()))
                    .append(',').append(csvCell(en != null ? en.getDescription() : product.getDescription()))
                    .append(',').append(csvCell(zh != null ? zh.getDescription() : null))
                    .append(',').append(csvCell(product.getPrice()))
                    .append(',').append(product.isActive() ? "yes" : "no")
                    .append(',').append(csvCell(categories))
                    .append(',').append(csvCell(imageKeys))
                    .append(',').append(csvCell(imageFiles))
                    .append(',').append(csvCell(primaryKey))
                    .append(',').append(csvCell(product.getCreatedAt()))
                    .append(',').append(csvCell(product.getUpdatedAt()))
                    .append('\n');
        }
        return csv.toString();
    }

    private static String csvCell(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        if (text.indexOf(',') >= 0 || text.indexOf('"') >= 0 || text.indexOf('\n') >= 0
                || text.indexOf('\r') >= 0) {
            return '"' + text.replace("\"", "\"\"") + '"';
        }
        return text;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminProductDTO get(Long id) {
        return toDto(requireProduct(id), true);
    }

    @Override
    @Transactional
    public AdminProductDTO create(UpsertProductRequest request) {
        Product product = new Product();
        applyFields(product, request, true);
        LocalDateTime now = LocalDateTime.now();
        product.setCreatedAt(now);
        product.setUpdatedAt(now);
        product = productRepository.save(product);
        syncCategories(product, request.getCategoryIds());
        upsertEnglishTranslation(product);
        upsertChineseTranslation(product, request.getNameZh(), request.getDescriptionZh());
        return toDto(product, true);
    }

    @Override
    @Transactional
    public AdminProductDTO update(Long id, UpsertProductRequest request) {
        Product product = requireProduct(id);
        applyFields(product, request, false);
        product.setUpdatedAt(LocalDateTime.now());
        syncCategories(product, request.getCategoryIds());
        upsertEnglishTranslation(product);
        upsertChineseTranslation(product, request.getNameZh(), request.getDescriptionZh());
        return toDto(productRepository.save(product), true);
    }

    @Override
    @Transactional
    public AdminProductDTO setActive(Long id, boolean active) {
        Product product = requireProduct(id);
        product.setActive(active);
        product.setUpdatedAt(LocalDateTime.now());
        return toDto(productRepository.save(product), true);
    }

    @Override
    @Transactional
    public AdminProductDTO addImage(Long id, MultipartFile file) {
        return addImage(id, file, false);
    }

    @Override
    @Transactional
    public AdminProductDTO addImagePreservingFilename(Long id, MultipartFile file) {
        return addImage(id, file, true);
    }

    private AdminProductDTO addImage(Long id, MultipartFile file, boolean keepOriginalName) {
        Product product = requireProduct(id);
        List<Media> existing = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                ENTITY_TYPE, product.getId());
        String originalBasename = CatalogCsv.basename(file == null ? null : file.getOriginalFilename());
        if (keepOriginalName && !originalBasename.isBlank() && galleryHasBasename(existing, originalBasename)) {
            return toDto(product, true);
        }
        validateImage(file);

        String storageKey;
        if (keepOriginalName && !originalBasename.isBlank()) {
            storageKey = "products/" + product.getId() + "/" + sanitizeFilename(originalBasename);
        } else {
            storageKey = "products/" + product.getId() + "/" + UUID.randomUUID() + "." + extensionFor(file);
        }

        try {
            storageService.upload(
                    storageKey,
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType());
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read image file");
        }

        boolean makePrimary = existing.isEmpty();

        Media media = new Media();
        media.setStorageKey(storageKey);
        media.setAlt(keepOriginalName && !originalBasename.isBlank() ? originalBasename : product.getName());
        media.setPrimary(makePrimary);
        media.setCreatedAt(LocalDateTime.now());
        media.setEntityType(ENTITY_TYPE);
        media.setEntityId(product.getId());
        media = mediaRepository.save(media);

        if (makePrimary) {
            product.setImageMediaId(media.getId());
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        }
        return toDto(product, true);
    }

    private static boolean galleryHasBasename(List<Media> gallery, String basename) {
        String want = basename.toLowerCase(Locale.ROOT);
        return gallery.stream().anyMatch(media -> {
            String keyName = CatalogCsv.basename(media.getStorageKey()).toLowerCase(Locale.ROOT);
            String alt = media.getAlt() == null ? "" : media.getAlt().toLowerCase(Locale.ROOT);
            return want.equals(keyName) || want.equals(alt);
        });
    }

    private static String sanitizeFilename(String filename) {
        String cleaned = filename.replaceAll("[^a-zA-Z0-9._-]", "_").replace("..", "_");
        if (cleaned.isBlank() || cleaned.startsWith(".")) {
            return UUID.randomUUID() + ".jpg";
        }
        return cleaned;
    }

    @Override
    @Transactional
    public AdminProductDTO setPrimaryImage(Long id, Long imageId) {
        Product product = requireProduct(id);
        Media target = requireProductImage(product.getId(), imageId);

        List<Media> gallery = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                ENTITY_TYPE, product.getId());
        for (Media media : gallery) {
            media.setPrimary(false);
        }
        mediaRepository.saveAll(gallery);
        mediaRepository.flush();

        target.setPrimary(true);
        mediaRepository.save(target);
        product.setImageMediaId(target.getId());
        product.setUpdatedAt(LocalDateTime.now());
        return toDto(productRepository.save(product), true);
    }

    @Override
    @Transactional
    public AdminProductDTO deleteImage(Long id, Long imageId) {
        Product product = requireProduct(id);
        Media target = requireProductImage(product.getId(), imageId);
        String storageKey = target.getStorageKey();
        boolean wasPrimary = target.isPrimary()
                || (product.getImageMediaId() != null && product.getImageMediaId().equals(imageId));

        if (product.getImageMediaId() != null && product.getImageMediaId().equals(imageId)) {
            product.setImageMediaId(null);
            productRepository.saveAndFlush(product);
        }

        mediaRepository.delete(target);
        mediaRepository.flush();
        storageService.delete(storageKey);

        if (wasPrimary) {
            List<Media> remaining = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                    ENTITY_TYPE, product.getId());
            if (!remaining.isEmpty()) {
                Media next = remaining.get(0);
                next.setPrimary(true);
                mediaRepository.save(next);
                product.setImageMediaId(next.getId());
            }
        }
        product.setUpdatedAt(LocalDateTime.now());
        return toDto(productRepository.save(product), true);
    }

    private void applyFields(Product product, UpsertProductRequest request, boolean creating) {
        String name = request.getName().trim();
        product.setName(name);
        product.setDescription(blankToNull(request.getDescription()));
        product.setPrice(request.getPrice());
        product.setSku(normalizeSku(request.getSku()));

        boolean active = request.getActive() == null ? (creating || product.isActive()) : request.getActive();
        product.setActive(active);

        String requestedSlug = request.getSlug() == null ? "" : request.getSlug().trim();
        String slug = requestedSlug.isEmpty()
                ? (creating || isBlank(product.getSlug()) ? uniqueSlug(slugify(name), product.getId()) : product.getSlug())
                : uniqueSlug(slugify(requestedSlug), product.getId());
        product.setSlug(slug);

        assertSkuUnique(product.getSku(), product.getId());
    }

    private void syncCategories(Product product, List<Long> categoryIds) {
        List<Long> ids = categoryIds == null ? List.of() : categoryIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();

        Set<Category> desired = new HashSet<>();
        if (!ids.isEmpty()) {
            desired.addAll(categoryRepository.findAllById(ids));
            if (desired.size() != ids.size()) {
                throw new IllegalArgumentException("One or more categories were not found");
            }
        }

        Set<Category> current = new HashSet<>(product.getCategories());
        Set<Long> desiredIds = desired.stream().map(Category::getId).collect(Collectors.toSet());
        Set<Long> currentIds = current.stream().map(Category::getId).collect(Collectors.toSet());
        for (Category category : current) {
            if (!desiredIds.contains(category.getId())) {
                category.removeProduct(product);
            }
        }
        for (Category category : desired) {
            if (!currentIds.contains(category.getId())) {
                category.addProduct(product);
            }
        }
    }

    private void upsertEnglishTranslation(Product product) {
        upsertTranslation(product, "en", product.getName(), product.getDescription());
    }

    /**
     * Storefront Chinese uses {@code zh-HK} (language picker) and {@code zh-TW}
     * ({@code zh} normalized). Seed data is {@code zh-HK}. Keep both in sync.
     */
    private void upsertChineseTranslation(Product product, String nameZh, String descriptionZh) {
        String name = blankToNull(nameZh);
        String description = blankToNull(descriptionZh);
        if (name == null && description == null) {
            deleteTranslation(product.getId(), "zh-TW");
            deleteTranslation(product.getId(), "zh-HK");
            deleteTranslation(product.getId(), "zh");
            return;
        }
        if (name == null) {
            ProductTranslation existing = findChineseTranslation(product.getId());
            name = existing != null && !isBlank(existing.getName()) ? existing.getName() : product.getName();
        }
        upsertTranslation(product, "zh-TW", name, description);
        upsertTranslation(product, "zh-HK", name, description);
    }

    private void upsertTranslation(Product product, String locale, String name, String description) {
        ProductTranslation translation = translationRepository
                .findByProductIdAndLocale(product.getId(), locale)
                .orElseGet(ProductTranslation::new);
        if (translation.getId() == null) {
            translation.setProduct(product);
            translation.setLocale(locale);
            translation.setCreatedAt(LocalDateTime.now());
        }
        translation.setName(name);
        translation.setDescription(description);
        translation.setUpdatedAt(LocalDateTime.now());
        translationRepository.save(translation);
    }

    private void deleteTranslation(Long productId, String locale) {
        translationRepository.findByProductIdAndLocale(productId, locale)
                .ifPresent(translationRepository::delete);
    }

    private ProductTranslation findChineseTranslation(Long productId) {
        List<ProductTranslation> translations = translationRepository.findByProductId(productId);
        for (String locale : List.of("zh-TW", "zh-HK", "zh")) {
            for (ProductTranslation translation : translations) {
                if (locale.equalsIgnoreCase(translation.getLocale())) {
                    return translation;
                }
            }
        }
        return null;
    }

    private Product requireProduct(Long id) {
        return productRepository.findWithCategoriesById(id)
                .orElseGet(() -> productRepository.findById(id)
                        .orElseThrow(() -> new NotFoundException("Product not found")));
    }

    private Media requireProductImage(Long productId, Long imageId) {
        Media media = mediaRepository.findById(imageId)
                .orElseThrow(() -> new NotFoundException("Image not found"));
        if (!ENTITY_TYPE.equals(media.getEntityType()) || !productId.equals(media.getEntityId())) {
            throw new NotFoundException("Image not found");
        }
        return media;
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new IllegalArgumentException("Image must be 5MB or smaller");
        }
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Image must be JPEG, PNG, WebP, or GIF");
        }
    }

    private String extensionFor(MultipartFile file) {
        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
    }

    private String uniqueSlug(String base, Long currentId) {
        String candidate = base;
        int n = 2;
        while (slugTaken(candidate, currentId)) {
            candidate = base + "-" + n;
            n++;
        }
        return candidate;
    }

    private boolean slugTaken(String slug, Long currentId) {
        if (currentId == null) {
            return productRepository.existsBySlug(slug);
        }
        return productRepository.existsBySlugAndIdNot(slug, currentId);
    }

    private void assertSkuUnique(String sku, Long currentId) {
        if (sku == null) {
            return;
        }
        boolean taken = currentId == null
                ? productRepository.existsBySku(sku)
                : productRepository.existsBySkuAndIdNot(sku, currentId);
        if (taken) {
            throw new IllegalArgumentException("SKU is already in use");
        }
    }

    private String slugify(String value) {
        String slug = value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "product" : slug;
    }

    private String normalizeSku(String sku) {
        if (sku == null) {
            return null;
        }
        String trimmed = sku.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private AdminProductDTO toDto(Product product, boolean includeGallery) {
        List<Media> gallery = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                ENTITY_TYPE, product.getId());
        List<AdminProductImage> images = includeGallery
                ? gallery.stream().map(this::toAdminImage).collect(Collectors.toList())
                : new ArrayList<>();
        ProductImage thumbnail = resolveThumbnail(product, gallery);

        List<AdminCategoryRef> categories = product.getCategories().stream()
                .map(c -> new AdminCategoryRef(c.getId(), c.getName(), c.getSlug()))
                .collect(Collectors.toList());

        String nameZh = null;
        String descriptionZh = null;
        if (includeGallery) {
            ProductTranslation zh = findChineseTranslation(product.getId());
            if (zh != null) {
                nameZh = zh.getName();
                descriptionZh = zh.getDescription();
            }
        }

        return new AdminProductDTO(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getSku(),
                product.getDescription(),
                nameZh,
                descriptionZh,
                product.getPrice(),
                thumbnail,
                product.isActive(),
                images,
                categories,
                product.getCreatedAt(),
                product.getUpdatedAt());
    }

    private ProductImage resolveThumbnail(Product product, List<Media> gallery) {
        if (product.getImageMediaId() != null) {
            Media media = mediaRepository.findById(product.getImageMediaId()).orElse(null);
            if (media != null) {
                return toProductImage(media);
            }
        }
        return gallery.stream().findFirst().map(this::toProductImage).orElse(null);
    }

    private AdminProductImage toAdminImage(Media media) {
        return new AdminProductImage(
                media.getId(),
                storageService.publicUrl(media.getStorageKey()),
                mimeTypeFromStorageKey(media.getStorageKey()),
                media.isPrimary());
    }

    private ProductImage toProductImage(Media media) {
        return new ProductImage(
                media.getId(),
                storageService.publicUrl(media.getStorageKey()),
                mimeTypeFromStorageKey(media.getStorageKey()));
    }

    private String mimeTypeFromStorageKey(String storageKey) {
        if (storageKey == null || !storageKey.contains(".")) {
            return "image/jpeg";
        }
        String extension = storageKey.substring(storageKey.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }
}
