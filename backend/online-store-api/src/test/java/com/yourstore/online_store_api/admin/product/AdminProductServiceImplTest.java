package com.yourstore.online_store_api.admin.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import com.yourstore.common.NotFoundException;
import com.yourstore.online_store_api.category.Category;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.Media;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.product.Product;
import com.yourstore.online_store_api.product.ProductRepository;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.translation.ProductTranslation;
import com.yourstore.online_store_api.translation.ProductTranslationRepository;

@ExtendWith(MockitoExtension.class)
class AdminProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private ImageStorageService storageService;
    @Mock
    private ProductTranslationRepository translationRepository;

    @InjectMocks
    private AdminProductServiceImpl adminProductService;

    @Test
    void list_blankSearch_doesNotUseLikeQuery() {
        when(productRepository.listFiltered(isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        adminProductService.list(0, 20, "  ", null);

        verify(productRepository).listFiltered(isNull(), any(Pageable.class));
        verify(productRepository, never()).searchByText(any(), any(), any());
    }

    @Test
    void list_withSearch_usesTextQuery() {
        when(productRepository.searchByText(eq("bag"), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        adminProductService.list(0, 20, "bag", null);

        verify(productRepository).searchByText(eq("bag"), isNull(), any(Pageable.class));
    }

    @Test
    void exportCatalogCsv_includesProductRow() {
        Product product = product(21L, "Floral Keychain", true);
        product.setSku("FK-001");
        product.setSlug("floral-keychain");
        when(productRepository.findAllWithCategories()).thenReturn(List.of(product));
        when(translationRepository.findByProductIdAndLocale(21L, "en")).thenReturn(Optional.empty());
        when(translationRepository.findByProductIdAndLocale(21L, "zh-TW")).thenReturn(Optional.empty());
        when(translationRepository.findByProductIdAndLocale(21L, "zh")).thenReturn(Optional.empty());
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 21L))
                .thenReturn(List.of());

        String csv = adminProductService.exportCatalogCsv();

        assertThat(csv).contains("id,sku,slug,name");
        assertThat(csv).contains("Floral Keychain");
        assertThat(csv).contains("FK-001");
    }

    @Test
    void create_generatesSlugAndAssignsCategory() {
        when(productRepository.existsBySlug("floral-keychain")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(21L);
            return p;
        });
        Category bags = category(8L, "Bags", "bags");
        when(categoryRepository.findAllById(List.of(8L))).thenReturn(List.of(bags));
        when(translationRepository.findByProductIdAndLocale(21L, "en")).thenReturn(Optional.empty());
        when(translationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 21L))
                .thenReturn(List.of());

        UpsertProductRequest request = new UpsertProductRequest();
        request.setName("Floral Keychain");
        request.setPrice(new BigDecimal("12.00"));
        request.setCategoryIds(List.of(8L));

        AdminProductDTO dto = adminProductService.create(request);

        assertThat(dto.getSlug()).isEqualTo("floral-keychain");
        assertThat(dto.isStatus()).isTrue();
        assertThat(bags.getProducts()).extracting(Product::getId).contains(21L);
        verify(translationRepository).save(any());
    }

    @Test
    void create_savesChineseNameAndDescription() {
        when(productRepository.existsBySlug("floral-keychain")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(21L);
            return p;
        });
        when(translationRepository.findByProductIdAndLocale(eq(21L), anyString()))
                .thenReturn(Optional.empty());
        when(translationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(translationRepository.findByProductId(21L)).thenReturn(List.of());
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 21L))
                .thenReturn(List.of());

        UpsertProductRequest request = new UpsertProductRequest();
        request.setName("Floral Keychain");
        request.setPrice(new BigDecimal("12.00"));
        request.setNameZh("花卉鎖匙扣");
        request.setDescriptionZh("手作鎖匙扣");

        adminProductService.create(request);

        ArgumentCaptor<ProductTranslation> captor = ArgumentCaptor.forClass(ProductTranslation.class);
        verify(translationRepository, org.mockito.Mockito.atLeast(3)).save(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(ProductTranslation::getLocale)
                .contains("en", "zh-TW", "zh-HK");
        assertThat(captor.getAllValues())
                .filteredOn(t -> "zh-HK".equals(t.getLocale()))
                .extracting(ProductTranslation::getName)
                .containsExactly("花卉鎖匙扣");
    }

    @Test
    void create_rejectsDuplicateSku() {
        when(productRepository.existsBySku("SKU-1")).thenReturn(true);

        UpsertProductRequest request = new UpsertProductRequest();
        request.setName("Bag");
        request.setSku("SKU-1");
        request.setPrice(new BigDecimal("10.00"));

        assertThatThrownBy(() -> adminProductService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("SKU");
        verify(productRepository, never()).save(any());
    }

    @Test
    void setActive_disablesProduct() {
        Product product = product(5L, "Bag", true);
        when(productRepository.findWithCategoriesById(5L)).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(product);
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 5L))
                .thenReturn(List.of());

        AdminProductDTO dto = adminProductService.setActive(5L, false);

        assertThat(product.isActive()).isFalse();
        assertThat(dto.isStatus()).isFalse();
    }

    @Test
    void addImage_firstFileBecomesPrimary() throws Exception {
        Product product = product(3L, "Bag", true);
        when(productRepository.findWithCategoriesById(3L)).thenReturn(Optional.of(product));
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 3L))
                .thenReturn(List.of())
                .thenReturn(List.of());
        when(mediaRepository.save(any(Media.class))).thenAnswer(inv -> {
            Media m = inv.getArgument(0);
            m.setId(40L);
            return m;
        });
        when(productRepository.save(product)).thenReturn(product);

        MockMultipartFile file = new MockMultipartFile(
                "file", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        adminProductService.addImage(3L, file);

        verify(storageService).upload(anyString(), any(InputStream.class), eq(3L), eq("image/jpeg"));
        assertThat(product.getImageMediaId()).isEqualTo(40L);
    }

    @Test
    void addImagePreservingFilename_usesOriginalNameAndSkipsDuplicate() throws Exception {
        Product product = product(3L, "Bag", true);
        Media existing = new Media();
        existing.setId(40L);
        existing.setStorageKey("products/3/front.jpg");
        existing.setAlt("front.jpg");
        existing.setEntityType("product");
        existing.setEntityId(3L);
        when(productRepository.findWithCategoriesById(3L)).thenReturn(Optional.of(product));
        when(mediaRepository.findByEntityTypeAndEntityIdOrderByIsPrimaryDescIdAsc("product", 3L))
                .thenReturn(List.of(existing));

        MockMultipartFile file = new MockMultipartFile(
                "file", "front.jpg", "image/jpeg", new byte[] {1, 2, 3});

        adminProductService.addImagePreservingFilename(3L, file);

        verify(storageService, never()).upload(anyString(), any(), anyLong(), any());
        verify(mediaRepository, never()).save(any(Media.class));
    }

    @Test
    void get_missingProduct_throwsNotFound() {
        when(productRepository.findWithCategoriesById(99L)).thenReturn(Optional.empty());
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> adminProductService.get(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Product not found");
    }

    @Test
    void deleteImage_rejectsImageFromAnotherProduct() {
        Product product = product(1L, "Bag", true);
        Media media = new Media();
        media.setId(7L);
        media.setEntityType("product");
        media.setEntityId(2L);
        when(productRepository.findWithCategoriesById(1L)).thenReturn(Optional.of(product));
        when(mediaRepository.findById(7L)).thenReturn(Optional.of(media));

        assertThatThrownBy(() -> adminProductService.deleteImage(1L, 7L))
                .isInstanceOf(NotFoundException.class)
                .hasMessageContaining("Image not found");
        verify(mediaRepository, never()).delete(any());
    }

    private static Product product(Long id, String name, boolean active) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setSlug(name.toLowerCase());
        product.setPrice(new BigDecimal("10.00"));
        product.setActive(active);
        product.setCategories(new HashSet<>());
        return product;
    }

    private static Category category(Long id, String name, String slug) {
        Category category = new Category();
        category.setId(id);
        category.setName(name);
        category.setSlug(slug);
        category.setProducts(new HashSet<>());
        return category;
    }
}
