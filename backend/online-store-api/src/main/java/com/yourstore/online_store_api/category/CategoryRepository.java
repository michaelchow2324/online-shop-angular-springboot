package com.yourstore.online_store_api.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category persistence operations.
 * Extends Spring Data JPA for standard CRUD methods.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    List<Category> findAllByOrderBySortOrderAscIdAsc();
}
