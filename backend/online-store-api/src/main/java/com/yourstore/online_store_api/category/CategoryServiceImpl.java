package com.yourstore.online_store_api.category;

import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.translation.CategoryTranslation;
import com.yourstore.online_store_api.translation.CategoryTranslationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Default implementation of `CategoryService`.
 * Responsible for mapping `Category` entities to `CategoryDTO` and
 * composing image URLs using the `ImageStorageService`.
 */
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MediaRepository mediaRepository;
    private final ImageStorageService storageService;
    private final CategoryTranslationRepository translationRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository,
                               MediaRepository mediaRepository,
                               ImageStorageService storageService,
                               CategoryTranslationRepository translationRepository) {
        this.categoryRepository = categoryRepository;
        this.mediaRepository = mediaRepository;
        this.storageService = storageService;
        this.translationRepository = translationRepository;
    }

    
        // Intermediate (pipeline) operations — lazy (examples):
        //    map(...)      - transform each element (e.g. `map(this::toDto)`).
        //    filter(...)   - keep elements matching a predicate (e.g. `filter(Category::isActive)`).
        //    flatMap(...)  - map to streams and flatten nested structures.
        //    distinct()    - remove duplicates.
        //    sorted(...)   - sort elements.
        //    peek(...)     - inspect elements for debugging/side-effects.
        //    limit(n)/skip(n) - take or skip N elements.
        // Terminal operations — trigger execution and produce a result (examples):
        //    collect(...)  - accumulate to a collection, e.g. `collect(Collectors.toList())`.
        //    forEach(...)  - perform an action for each element.
        //    reduce(...)   - fold elements to a single value.
        //    count()       - number of elements.
        //    anyMatch/allMatch/noneMatch - boolean checks.
        //    findFirst/findAny - return an Optional element.
        
    @Override
    public List<CategoryDTO> findAll(String locale) {
        // Stream pipeline explanation:
        // 1) `findAll()` returns a List<Category>.
        // 2) `.stream()` creates a Stream<Category> and starts the pipeline.
        // Equivalent imperative code:
        // List<CategoryDTO> out = new ArrayList<>();
        // for (Category c : categoryRepository.findAll()) { out.add(toDto(c)); }
        // return out;
        String normalizedLocale = normalizeLocale(locale);
        return categoryRepository.findAll().stream().map(c -> toDto(c, normalizedLocale)).collect(Collectors.toList());
    }

    @Override
    public Optional<CategoryDTO> findBySlug(String slug, String locale) {
        String normalizedLocale = normalizeLocale(locale);
        return categoryRepository.findBySlug(slug).map(c -> toDto(c, normalizedLocale));
    }

    /**
     * Map a `Category` entity to a `CategoryDTO`, resolving the image URL
     * from the `media` table and the configured storage service.
     */
    private CategoryDTO toDto(Category c, String locale) {
        // Resolve the image URL from the media table via the storage service
        CategoryDTO.CategoryImage categoryImage = null;
        if (c.getImageMediaId() != null) {
            Media m = mediaRepository.findById(c.getImageMediaId()).orElse(null);
            if (m != null) {
                // Wrap the URL in a nested object matching the frontend's IAttachment interface:
                // { original_url: "http://..." } — read by the template as category_image.original_url
                categoryImage = new CategoryDTO.CategoryImage(storageService.publicUrl(m.getStorageKey()));
            }
        }
        CategoryTranslation translation = translationRepository.findByCategoryIdAndLocale(c.getId(), locale)
                .orElse(null);

        String translatedName = translation != null && translation.getName() != null ? translation.getName() : c.getName();
        String translatedDescription = translation != null && translation.getDescription() != null ? translation.getDescription() : c.getDescription();

        // `active` maps to `status` to align with the frontend's ICategory.status field
        return new CategoryDTO(c.getId(), translatedName, c.getSlug(), translatedDescription, categoryImage, c.isActive());
    }

    private String normalizeLocale(String locale) {
        if (locale == null || locale.isBlank()) {
            return "en";
        }
        return "zh".equalsIgnoreCase(locale) ? "zh-TW" : locale;
    }
}
