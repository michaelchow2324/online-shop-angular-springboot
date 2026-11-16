package com.yourstore.online_store_api.admin.category;

import java.io.IOException;
import java.time.LocalDateTime;
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
import com.yourstore.online_store_api.admin.category.AdminCategoryDTO.CategoryImage;
import com.yourstore.online_store_api.category.Category;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.translation.CategoryTranslation;
import com.yourstore.online_store_api.translation.CategoryTranslationRepository;

@Service
public class AdminCategoryServiceImpl implements AdminCategoryService {

    private static final String ENTITY_TYPE = "category";
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;
    private static final int DEFAULT_SORT_ORDER = 100;
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private final CategoryRepository categoryRepository;
    private final MediaRepository mediaRepository;
    private final ImageStorageService storageService;
    private final CategoryTranslationRepository translationRepository;

    AdminCategoryServiceImpl(
            CategoryRepository categoryRepository,
            MediaRepository mediaRepository,
            ImageStorageService storageService,
            CategoryTranslationRepository translationRepository) {
        this.categoryRepository = categoryRepository;
        this.mediaRepository = mediaRepository;
        this.storageService = storageService;
        this.translationRepository = translationRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminCategoryDTO> list(int page, int size, String q, Boolean active) {
        int normalizedPage = Math.max(page, DEFAULT_PAGE);
        int normalizedSize = size <= 0 ? DEFAULT_SIZE : Math.min(size, MAX_SIZE);
        String query = q == null || q.isBlank() ? null : q.trim();
        Pageable pageable = PageRequest.of(
                normalizedPage,
                normalizedSize,
                Sort.by(Sort.Order.asc("sortOrder"), Sort.Order.asc("id")));
        Page<Category> categoriesPage = query == null
                ? categoryRepository.listFiltered(active, pageable)
                : categoryRepository.searchByText(query, active, pageable);
        List<AdminCategoryDTO> dtos = categoriesPage.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new PagedResponse<>(
                dtos,
                normalizedPage,
                normalizedSize,
                categoriesPage.getTotalElements(),
                categoriesPage.getTotalPages(),
                categoriesPage.hasNext(),
                categoriesPage.hasPrevious());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCategoryDTO get(Long id) {
        return toDto(requireCategory(id));
    }

    @Override
    @Transactional
    public AdminCategoryDTO create(UpsertCategoryRequest request) {
        Category category = new Category();
        category.setCreatedAt(LocalDateTime.now());
        applyUpsert(category, request, true);
        category = categoryRepository.save(category);
        upsertEnglishTranslation(category);
        upsertChineseTranslation(category, request.getNameZh());
        return toDto(category);
    }

    @Override
    @Transactional
    public AdminCategoryDTO update(Long id, UpsertCategoryRequest request) {
        Category category = requireCategory(id);
        applyUpsert(category, request, false);
        category = categoryRepository.save(category);
        upsertEnglishTranslation(category);
        upsertChineseTranslation(category, request.getNameZh());
        return toDto(category);
    }

    @Override
    @Transactional
    public AdminCategoryDTO setActive(Long id, boolean active) {
        Category category = requireCategory(id);
        category.setActive(active);
        category.setUpdatedAt(LocalDateTime.now());
        return toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public AdminCategoryDTO uploadImage(Long id, MultipartFile file) {
        Category category = requireCategory(id);
        validateImage(file);

        // Replace any existing category media rows + storage objects
        clearCategoryMedia(category);

        String storageKey = "categories/" + category.getId() + "/" + UUID.randomUUID() + "." + extensionFor(file);
        try {
            storageService.upload(
                    storageKey,
                    file.getInputStream(),
                    file.getSize(),
                    file.getContentType());
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read image file");
        }

        Media media = new Media();
        media.setStorageKey(storageKey);
        media.setAlt(category.getName());
        media.setPrimary(true);
        media.setCreatedAt(LocalDateTime.now());
        media.setEntityType(ENTITY_TYPE);
        media.setEntityId(category.getId());
        media = mediaRepository.save(media);

        category.setImageMediaId(media.getId());
        category.setUpdatedAt(LocalDateTime.now());
        return toDto(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public AdminCategoryDTO deleteImage(Long id) {
        Category category = requireCategory(id);
        clearCategoryMedia(category);
        category.setImageMediaId(null);
        category.setUpdatedAt(LocalDateTime.now());
        return toDto(categoryRepository.save(category));
    }

    private void applyUpsert(Category category, UpsertCategoryRequest request, boolean creating) {
        String name = request.getName().trim();
        category.setName(name);

        boolean active = request.getActive() == null ? (creating || category.isActive()) : request.getActive();
        category.setActive(active);

        int sortOrder = request.getSortOrder() == null
                ? (creating ? DEFAULT_SORT_ORDER : category.getSortOrder())
                : request.getSortOrder();
        category.setSortOrder(sortOrder);

        String requestedSlug = request.getSlug();
        String slug = isBlank(requestedSlug)
                ? (creating || isBlank(category.getSlug()) ? uniqueSlug(slugify(name), category.getId()) : category.getSlug())
                : uniqueSlug(slugify(requestedSlug.trim()), category.getId());
        category.setSlug(slug);
        category.setUpdatedAt(LocalDateTime.now());
    }

    private void upsertEnglishTranslation(Category category) {
        upsertTranslation(category, "en", category.getName(), category.getDescription());
    }

    /**
     * Storefront Chinese uses {@code zh-HK} (language picker) and {@code zh-TW}
     * ({@code zh} normalized). Seed data is {@code zh-HK}. Keep both in sync.
     */
    private void upsertChineseTranslation(Category category, String nameZh) {
        String name = blankToNull(nameZh);
        if (name == null) {
            deleteTranslation(category.getId(), "zh-TW");
            deleteTranslation(category.getId(), "zh-HK");
            deleteTranslation(category.getId(), "zh");
            return;
        }
        CategoryTranslation existing = findChineseTranslation(category.getId());
        String description = existing != null ? existing.getDescription() : null;
        upsertTranslation(category, "zh-TW", name, description);
        upsertTranslation(category, "zh-HK", name, description);
    }

    private void upsertTranslation(Category category, String locale, String name, String description) {
        CategoryTranslation translation = translationRepository
                .findByCategoryIdAndLocale(category.getId(), locale)
                .orElseGet(CategoryTranslation::new);
        if (translation.getId() == null) {
            translation.setCategory(category);
            translation.setLocale(locale);
            translation.setCreatedAt(LocalDateTime.now());
        }
        translation.setName(name);
        translation.setDescription(description);
        translation.setUpdatedAt(LocalDateTime.now());
        translationRepository.save(translation);
    }

    private void deleteTranslation(Long categoryId, String locale) {
        translationRepository.findByCategoryIdAndLocale(categoryId, locale)
                .ifPresent(translationRepository::delete);
    }

    private CategoryTranslation findChineseTranslation(Long categoryId) {
        List<CategoryTranslation> translations = translationRepository.findByCategoryId(categoryId);
        for (String locale : List.of("zh-TW", "zh-HK", "zh")) {
            for (CategoryTranslation translation : translations) {
                if (locale.equalsIgnoreCase(translation.getLocale())) {
                    return translation;
                }
            }
        }
        return null;
    }

    private void clearCategoryMedia(Category category) {
        List<Media> existing = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                ENTITY_TYPE, category.getId());
        for (Media media : existing) {
            storageService.delete(media.getStorageKey());
            mediaRepository.delete(media);
        }
        if (category.getImageMediaId() != null && existing.isEmpty()) {
            mediaRepository.findById(category.getImageMediaId()).ifPresent(media -> {
                storageService.delete(media.getStorageKey());
                mediaRepository.delete(media);
            });
        }
        category.setImageMediaId(null);
    }

    private Category requireCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Category not found"));
    }

    private AdminCategoryDTO toDto(Category category) {
        CategoryImage image = null;
        if (category.getImageMediaId() != null) {
            Media media = mediaRepository.findById(category.getImageMediaId()).orElse(null);
            if (media != null) {
                image = new CategoryImage(media.getId(), storageService.publicUrl(media.getStorageKey()));
            }
        }
        String nameZh = null;
        CategoryTranslation zh = findChineseTranslation(category.getId());
        if (zh != null) {
            nameZh = zh.getName();
        }
        return new AdminCategoryDTO(
                category.getId(),
                category.getName(),
                category.getSlug(),
                nameZh,
                category.getSortOrder(),
                image,
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt());
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
            return categoryRepository.existsBySlug(slug);
        }
        return categoryRepository.existsBySlugAndIdNot(slug, currentId);
    }

    private String slugify(String value) {
        String slug = value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return slug.isBlank() ? "category" : slug;
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
}
