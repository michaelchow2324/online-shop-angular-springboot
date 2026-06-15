package com.yourstore.online_store_api.category;

import java.util.List;
import java.util.Optional;

/**
 * Service API for Category-related business logic.
 * Implementations should keep business rules and mapping here.
 */
public interface CategoryService {
    List<CategoryDTO> findAll(String locale);
    Optional<CategoryDTO> findBySlug(String slug, String locale);
}
