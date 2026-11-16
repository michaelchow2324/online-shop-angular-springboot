package com.yourstore.online_store_api.admin.category;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.yourstore.online_store_api.category.Category;
import com.yourstore.online_store_api.category.CategoryRepository;
import com.yourstore.online_store_api.media.MediaRepository;
import com.yourstore.online_store_api.storage.ImageStorageService;
import com.yourstore.online_store_api.translation.CategoryTranslation;
import com.yourstore.online_store_api.translation.CategoryTranslationRepository;

@ExtendWith(MockitoExtension.class)
class AdminCategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private MediaRepository mediaRepository;
    @Mock
    private ImageStorageService storageService;
    @Mock
    private CategoryTranslationRepository translationRepository;

    @InjectMocks
    private AdminCategoryServiceImpl adminCategoryService;

    @Test
    void create_savesChineseName() {
        when(categoryRepository.existsBySlug("coin-pouches")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category category = inv.getArgument(0);
            category.setId(4L);
            return category;
        });
        when(translationRepository.findByCategoryIdAndLocale(eq(4L), anyString()))
                .thenReturn(Optional.empty());
        when(translationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(translationRepository.findByCategoryId(4L)).thenReturn(List.of());

        UpsertCategoryRequest request = new UpsertCategoryRequest();
        request.setName("Coin Pouches");
        request.setNameZh("散銀包");

        adminCategoryService.create(request);

        ArgumentCaptor<CategoryTranslation> captor = ArgumentCaptor.forClass(CategoryTranslation.class);
        verify(translationRepository, org.mockito.Mockito.atLeast(3)).save(captor.capture());
        assertThat(captor.getAllValues())
                .extracting(CategoryTranslation::getLocale)
                .contains("en", "zh-TW", "zh-HK");
        assertThat(captor.getAllValues())
                .filteredOn(t -> "zh-HK".equals(t.getLocale()))
                .extracting(CategoryTranslation::getName)
                .containsExactly("散銀包");
    }
}
