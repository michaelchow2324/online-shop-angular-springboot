package com.yourstore.online_store_api.translation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryTranslationRepository extends JpaRepository<CategoryTranslation, Long> {
    Optional<CategoryTranslation> findByCategoryIdAndLocale(Long categoryId, String locale);
}
