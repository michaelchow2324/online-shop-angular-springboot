package com.yourstore.online_store_api.admin.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import com.yourstore.online_store_api.category.Category;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.translation.ProductTranslation;
import com.yourstore.online_store_api.translation.ProductTranslationRepository;

@ExtendWith(MockitoExtension.class)
class CatalogImportServiceTest {

    @Mock
    private AdminProductService adminProductService;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private ProductTranslationRepository translationRepository;

    @InjectMocks
    private CatalogImportService catalogImportService;

    @Test
    void import_createsProductAndAttachesImage() {
        when(productRepository.findBySlug("floral-keychain")).thenReturn(Optional.empty());
        when(productRepository.findBySku("FK-001")).thenReturn(Optional.empty());
        Category bags = category(8L, "bags");
        when(categoryRepository.findBySlug("bags")).thenReturn(Optional.of(bags));
        AdminProductDTO created = productDto(21L, "Floral Keychain");
        when(adminProductService.create(any(UpsertProductRequest.class))).thenReturn(created);
        when(productRepository.findById(21L)).thenReturn(Optional.of(product(21L, "Floral Keychain")));
        when(translationRepository.findByProductIdAndLocale(21L, "zh-TW")).thenReturn(Optional.empty());
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 21L))
                .thenReturn(List.of())
                .thenReturn(List.of(media(40L, "products/21/front.jpg", "front.jpg", true)));
        when(adminProductService.addImagePreservingFilename(eq(21L), any())).thenReturn(created);

        MockMultipartFile csv = csvFile("""
                sku,slug,name_en,name_zh,price,categories,image_files,primary_image,active
                FK-001,floral-keychain,Floral Keychain,花卉鎖匙扣,12.00,bags,front.jpg,front.jpg,yes
                """);
        MockMultipartFile image = new MockMultipartFile(
                "images", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        CatalogImportResult result = catalogImportService.importCatalog(csv, List.of(image));

        assertThat(result.getCreated()).isEqualTo(1);
        assertThat(result.getUpdated()).isZero();
        assertThat(result.getImagesUploaded()).isEqualTo(1);
        assertThat(result.getErrors()).isEmpty();

        ArgumentCaptor<UpsertProductRequest> captor = ArgumentCaptor.forClass(UpsertProductRequest.class);
        verify(adminProductService).create(captor.capture());
        assertThat(captor.getValue().getName()).isEqualTo("Floral Keychain");
        assertThat(captor.getValue().getCategoryIds()).containsExactly(8L);
        verify(adminProductService).addImagePreservingFilename(eq(21L), any());
        verify(translationRepository).save(any(ProductTranslation.class));
    }

    @Test
    void import_updatesExistingBySlug() {
        Product existing = product(21L, "Old name");
        existing.setSlug("floral-keychain");
        when(productRepository.findBySlug("floral-keychain")).thenReturn(Optional.of(existing));
        when(adminProductService.update(eq(21L), any(UpsertProductRequest.class)))
                .thenReturn(productDto(21L, "Floral Keychain"));

        MockMultipartFile csv = csvFile("""
                slug,name,price,active
                floral-keychain,Floral Keychain,15.00,yes
                """);

        CatalogImportResult result = catalogImportService.importCatalog(csv, List.of());

        assertThat(result.getCreated()).isZero();
        assertThat(result.getUpdated()).isEqualTo(1);
        verify(adminProductService).update(eq(21L), any(UpsertProductRequest.class));
        verify(adminProductService, never()).create(any());
        verify(adminProductService, never()).addImagePreservingFilename(any(), any());
    }

    @Test
    void import_skipsImageWhenBasenameAlreadyOnProduct() {
        Product existing = product(21L, "Floral Keychain");
        existing.setSlug("floral-keychain");
        when(productRepository.findBySlug("floral-keychain")).thenReturn(Optional.of(existing));
        when(adminProductService.update(eq(21L), any(UpsertProductRequest.class)))
                .thenReturn(productDto(21L, "Floral Keychain"));
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 21L))
                .thenReturn(List.of(media(40L, "products/21/front.jpg", "front.jpg", true)));

        MockMultipartFile csv = csvFile("""
                slug,name,price,image_files
                floral-keychain,Floral Keychain,12.00,front.jpg
                """);
        MockMultipartFile image = new MockMultipartFile(
                "images", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        CatalogImportResult result = catalogImportService.importCatalog(csv, List.of(image));

        assertThat(result.getUpdated()).isEqualTo(1);
        assertThat(result.getImagesUploaded()).isZero();
        verify(adminProductService, never()).addImagePreservingFilename(any(), any());
    }

    @Test
    void import_recordsErrorAndContinues() {
        when(productRepository.findBySlug("good-item")).thenReturn(Optional.empty());
        when(productRepository.findBySku("OK-1")).thenReturn(Optional.empty());
        when(adminProductService.create(any(UpsertProductRequest.class)))
                .thenReturn(productDto(22L, "Good item"));

        MockMultipartFile csv = csvFile("""
                sku,slug,name,price
                BAD,,No Price Here,
                OK-1,good-item,Good item,9.00
                """);

        CatalogImportResult result = catalogImportService.importCatalog(csv, List.of());

        assertThat(result.getCreated()).isEqualTo(1);
        assertThat(result.getErrors()).anyMatch(msg -> msg.contains("Row 2") && msg.contains("price"));
    }

    private static MockMultipartFile csvFile(String content) {
        return new MockMultipartFile(
                "csv", "products.csv", "text/csv", content.getBytes(StandardCharsets.UTF_8));
    }

    private static AdminProductDTO productDto(Long id, String name) {
        AdminProductDTO dto = new AdminProductDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setPrice(new BigDecimal("12.00"));
        dto.setStatus(true);
        return dto;
    }

    private static Product product(Long id, String name) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setSlug(name.toLowerCase().replace(' ', '-'));
        product.setPrice(new BigDecimal("12.00"));
        return product;
    }

    private static Category category(Long id, String slug) {
        Category category = new Category();
        category.setId(id);
        category.setName(slug);
        category.setSlug(slug);
        return category;
    }

    private static Media media(Long id, String storageKey, String alt, boolean primary) {
        Media media = new Media();
        media.setId(id);
        media.setStorageKey(storageKey);
        media.setAlt(alt);
        media.setPrimary(primary);
        media.setEntityType("product");
        media.setEntityId(21L);
        return media;
    }
}
