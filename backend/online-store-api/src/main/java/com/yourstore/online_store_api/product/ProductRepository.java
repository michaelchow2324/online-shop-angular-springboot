package com.yourstore.online_store_api.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Optional means the product can be empty if not found. The caller must check if the product exists before accessing it.
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);
    Optional<Product> findBySku(String sku);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categories WHERE p.id = :id")
    Optional<Product> findWithCategoriesById(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.categories")
    List<Product> findAllWithCategories();

    /**
     * Admin list without a search box value.
     * Do not CONCAT a null {@code :q} here — Postgres infers untyped null as {@code bytea}
     * and {@code LOWER(bytea)} fails.
     */
    @Query("""
            SELECT p FROM Product p
            WHERE :active IS NULL OR p.active = :active
            """)
    Page<Product> listFiltered(@Param("active") Boolean active, Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE (:active IS NULL OR p.active = :active)
              AND (
                LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
                OR LOWER(COALESCE(p.sku, '')) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
                OR LOWER(p.slug) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%'))
              )
            """)
    Page<Product> searchByText(@Param("q") String q, @Param("active") Boolean active, Pageable pageable);

    // Page is a Spring Data interface. It contains the List of products for the current page, total number of products, total pages, etc. The caller can use this info to implement pagination in the frontend.
    Page<Product> findByActiveTrue(Pageable pageable); // find all active products
    Page<Product> findByCategoriesSlugAndActiveTrue(String slug, Pageable pageable);
}
