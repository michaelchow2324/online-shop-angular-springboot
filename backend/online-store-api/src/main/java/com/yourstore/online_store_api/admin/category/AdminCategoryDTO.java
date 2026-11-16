package com.yourstore.online_store_api.admin.category;

import java.time.LocalDateTime;

/**
 * Admin category JSON. {@code status} mirrors product admin (entity {@code active}).
 */
public record AdminCategoryDTO(
        Long id,
        String name,
        String slug,
        String description,
        int sortOrder,
        CategoryImage category_image,
        boolean status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public record CategoryImage(Long id, String original_url) {
    }
}
