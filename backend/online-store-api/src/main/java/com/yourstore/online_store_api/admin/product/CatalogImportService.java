package com.yourstore.online_store_api.admin.product;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.yourstore.online_store_api.category.Category;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.translation.ProductTranslation;
import com.yourstore.online_store_api.translation.ProductTranslationRepository;

/**
 * Rebuilds the product catalog from a CSV plus image files.
 * This is not a full shop restore — use Postgres + MinIO/R2 backups for that.
 */
@Service
public class CatalogImportService {

    private static final String ENTITY_TYPE = "product";
    private static final Set<String> ACTIVE_TRUE = Set.of("yes", "true", "1", "y");
    private static final Set<String> ACTIVE_FALSE = Set.of("no", "false", "0", "n");

    private final AdminProductService adminProductService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MediaRepository mediaRepository;
    private final ProductTranslationRepository translationRepository;

    CatalogImportService(
            AdminProductService adminProductService,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            MediaRepository mediaRepository,
            ProductTranslationRepository translationRepository) {
        this.adminProductService = adminProductService;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.mediaRepository = mediaRepository;
        this.translationRepository = translationRepository;
    }

    public CatalogImportResult importCatalog(MultipartFile csv, List<MultipartFile> images) {
        if (csv == null || csv.isEmpty()) {
            throw new IllegalArgumentException("CSV file is required");
        }
        String raw;
        try {
            raw = new String(csv.getBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read CSV file");
        }

        CatalogImportResult result = new CatalogImportResult();
        List<Map<String, String>> rows = CatalogCsv.parse(raw);
        if (rows.isEmpty()) {
            result.getErrors().add("No product rows found. Check the header line and CSV contents.");
            return result;
        }

        Map<String, MultipartFile> filesByName = indexImages(images);
        int rowNum = 2;
        for (Map<String, String> row : rows) {
            try {
                importRow(row, filesByName, result, rowNum);
            } catch (RuntimeException ex) {
                result.getErrors().add("Row " + rowNum + ": " + ex.getMessage());
            }
            rowNum++;
        }
        return result;
    }

    private void importRow(
            Map<String, String> row,
            Map<String, MultipartFile> filesByName,
            CatalogImportResult result,
            int rowNum) {
        String name = CatalogCsv.cell(row, "name", "name_en");
        if (name.isBlank()) {
            result.getErrors().add("Row " + rowNum + ": product name is required");
            return;
        }
        String priceCell = CatalogCsv.cell(row, "price");
        if (priceCell.isBlank()) {
            result.getErrors().add("Row " + rowNum + ": price is required");
            return;
        }
        BigDecimal price;
        try {
            price = new BigDecimal(priceCell);
        } catch (NumberFormatException ex) {
            result.getErrors().add("Row " + rowNum + ": invalid price");
            return;
        }

        String slug = CatalogCsv.cell(row, "slug");
        String sku = CatalogCsv.cell(row, "sku");
        Product existing = findExisting(slug, sku).orElse(null);

        UpsertProductRequest request = new UpsertProductRequest();
        request.setName(name);
        request.setSlug(slug.isBlank() ? null : slug);
        request.setSku(sku.isBlank() ? null : sku);
        request.setDescription(blankToNull(CatalogCsv.cell(row, "description", "description_en")));
        request.setPrice(price);
        request.setActive(parseActive(CatalogCsv.cell(row, "active")));
        request.setCategoryIds(resolveCategoryIds(CatalogCsv.cell(row, "categories"), result, rowNum));

        AdminProductDTO saved;
        if (existing == null) {
            saved = adminProductService.create(request);
            result.setCreated(result.getCreated() + 1);
        } else {
            saved = adminProductService.update(existing.getId(), request);
            result.setUpdated(result.getUpdated() + 1);
        }

        upsertChineseTranslation(
                saved.getId(),
                CatalogCsv.cell(row, "name_zh"),
                CatalogCsv.cell(row, "description_zh"));

        List<String> wantedImages = referencedImages(row);
        String primaryName = CatalogCsv.basename(CatalogCsv.cell(row, "primary_image", "primary_image_key"));
        int uploaded = attachImages(saved.getId(), wantedImages, filesByName, result, rowNum);
        result.setImagesUploaded(result.getImagesUploaded() + uploaded);
        applyPrimary(saved.getId(), primaryName);
    }

    private Optional<Product> findExisting(String slug, String sku) {
        if (!slug.isBlank()) {
            Optional<Product> bySlug = productRepository.findBySlug(slug);
            if (bySlug.isPresent()) {
                return bySlug;
            }
        }
        if (!sku.isBlank()) {
            return productRepository.findBySku(sku);
        }
        return Optional.empty();
    }

    private List<Long> resolveCategoryIds(String categoriesCell, CatalogImportResult result, int rowNum) {
        List<Long> ids = new ArrayList<>();
        for (String slug : CatalogCsv.splitList(categoriesCell)) {
            Optional<Category> category = categoryRepository.findBySlug(slug);
            if (category.isPresent()) {
                ids.add(category.get().getId());
            } else {
                result.getErrors().add("Row " + rowNum + ": unknown category " + slug);
            }
        }
        return ids;
    }

    private void upsertChineseTranslation(Long productId, String nameZh, String descriptionZh) {
        if (isBlank(nameZh) && isBlank(descriptionZh)) {
            return;
        }
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return;
        }
        ProductTranslation translation = translationRepository
                .findByProductIdAndLocale(productId, "zh-TW")
                .orElseGet(ProductTranslation::new);
        if (translation.getId() == null) {
            if (isBlank(nameZh)) {
                return;
            }
            translation.setProduct(product);
            translation.setLocale("zh-TW");
            translation.setCreatedAt(LocalDateTime.now());
        }
        if (!isBlank(nameZh)) {
            translation.setName(nameZh);
        } else if (translation.getName() == null) {
            translation.setName(product.getName());
        }
        if (!isBlank(descriptionZh)) {
            translation.setDescription(descriptionZh);
        }
        translation.setUpdatedAt(LocalDateTime.now());
        translationRepository.save(translation);
    }

    private List<String> referencedImages(Map<String, String> row) {
        LinkedHashSet<String> names = new LinkedHashSet<>();
        for (String column : List.of("image_files", "image_keys")) {
            for (String item : CatalogCsv.splitList(row.getOrDefault(column, ""))) {
                String basename = CatalogCsv.basename(item);
                if (!basename.isBlank()) {
                    names.add(basename);
                }
            }
        }
        String primary = CatalogCsv.basename(CatalogCsv.cell(row, "primary_image", "primary_image_key"));
        if (!primary.isBlank()) {
            names.add(primary);
        }
        return new ArrayList<>(names);
    }

    private int attachImages(
            Long productId,
            List<String> wantedNames,
            Map<String, MultipartFile> filesByName,
            CatalogImportResult result,
            int rowNum) {
        if (wantedNames.isEmpty()) {
            return 0;
        }
        List<Media> gallery = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                ENTITY_TYPE, productId);
        int uploaded = 0;
        for (String wanted : wantedNames) {
            if (galleryHasBasename(gallery, wanted)) {
                continue;
            }
            MultipartFile file = filesByName.get(wanted.toLowerCase(Locale.ROOT));
            if (file == null) {
                result.getErrors().add("Row " + rowNum + ": missing image " + wanted);
                continue;
            }
            adminProductService.addImagePreservingFilename(productId, file);
            uploaded++;
            gallery = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                    ENTITY_TYPE, productId);
        }
        return uploaded;
    }

    private void applyPrimary(Long productId, String primaryName) {
        if (primaryName.isBlank()) {
            return;
        }
        List<Media> gallery = mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc(
                ENTITY_TYPE, productId);
        for (Media media : gallery) {
            if (matchesBasename(media, primaryName) && !media.isPrimary()) {
                adminProductService.setPrimaryImage(productId, media.getId());
                return;
            }
        }
    }

    private static Map<String, MultipartFile> indexImages(List<MultipartFile> images) {
        Map<String, MultipartFile> byName = new LinkedHashMap<>();
        if (images == null) {
            return byName;
        }
        for (MultipartFile file : images) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String name = CatalogCsv.basename(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
            if (!name.isBlank()) {
                byName.put(name, file);
            }
        }
        return byName;
    }

    private static boolean galleryHasBasename(List<Media> gallery, String basename) {
        return gallery.stream().anyMatch(media -> matchesBasename(media, basename));
    }

    private static boolean matchesBasename(Media media, String basename) {
        String want = basename.toLowerCase(Locale.ROOT);
        String keyName = CatalogCsv.basename(media.getStorageKey()).toLowerCase(Locale.ROOT);
        String alt = media.getAlt() == null ? "" : media.getAlt().toLowerCase(Locale.ROOT);
        return want.equals(keyName) || want.equals(alt);
    }

    private static Boolean parseActive(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        if (ACTIVE_TRUE.contains(normalized)) {
            return true;
        }
        if (ACTIVE_FALSE.contains(normalized)) {
            return false;
        }
        return null;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }
}
