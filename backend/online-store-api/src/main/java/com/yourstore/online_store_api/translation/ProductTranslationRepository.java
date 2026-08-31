package com.yourstore.online_store_api.translation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductTranslationRepository extends JpaRepository<ProductTranslation, Long> {
    Optional<ProductTranslation> findByProductIdAndLocale(Long productId, String locale);

    List<ProductTranslation> findByProductId(Long productId);
}
