package com.yourstore.online_store_api.category;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Category persistence operations.
 * Extends Spring Data JPA for standard CRUD methods.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    List<Category> findAllByOrderBySortOrderAscIdAsc();

    List<Category> findAllByActiveTrueOrderBySortOrderAscIdAsc();

    @Query("""
            SELECT c FROM Category c
            WHERE (:active IS NULL OR c.active = :active)
            """)
    Page<Category> listFiltered(@Param("active") Boolean active, Pageable pageable);

    @Query("""
            SELECT c FROM Category c
            WHERE (:active IS NULL OR c.active = :active)
              AND (
                LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
                OR LOWER(c.slug) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
              )
            """)
    Page<Category> searchByText(
            @Param("q") String q,
            @Param("active") Boolean active,
            Pageable pageable);
}
