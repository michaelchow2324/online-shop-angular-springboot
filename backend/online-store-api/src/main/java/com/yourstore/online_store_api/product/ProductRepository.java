package com.yourstore.online_store_api.product;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Optional means the product can be empty if not found. The caller must check if the product exists before accessing it.
    Optional<Product> findBySlug(String slug);
    Optional<Product> findBySlugAndActiveTrue(String slug);

    //for list/set we don't use Optional because an empty list/set can represent "no products found for this category", which is different from "category not found".
    // List<Product> findByCategoriesId(Long categoryId);
    // List<Product> findByCategoriesSlugAndActiveTrue(String slug);

    // Page is a Spring Data interface. It contains the List of products for the current page, total number of products, total pages, etc. The caller can use this info to implement pagination in the frontend.
    Page<Product> findByActiveTrue(Pageable pageable); // find all active products
    Page<Product> findByCategoriesSlugAndActiveTrue(String slug, Pageable pageable);

    //findall product already provided by JpartRepository, so no need to declare it here
}
