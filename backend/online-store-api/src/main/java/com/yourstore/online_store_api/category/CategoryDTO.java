package com.yourstore.online_store_api.category;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Data Transfer Object for Category responses.
 *
 * Why a DTO instead of returning the JPA entity directly:
 * - Separation: decouples API contract from persistence model so DB changes
 *   don't break frontend clients.
 * - Security: prevents accidentally exposing internal fields or relationships.
 * - Serialization safety: avoids lazy-loading / Hibernate proxies and
 *   {@code LazyInitializationException} outside transaction scope.
 * - Stability: provides a stable, versionable JSON contract for clients.
 * - Performance/control: lets services shape payloads and avoid over-fetching.
 *
 * The JSON shape matches the frontend's ICategory / IAttachment interfaces:
 *   { id, name, slug, description, category_image: { original_url }, status }
 *
 * Use the service layer to map `Category` -> `CategoryDTO` and return DTOs
 * to controllers.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CategoryDTO {

    /**
     * Nested object matching the frontend's IAttachment interface.
     * The template reads `category.category_image.original_url` to display the image.
     */
    public static class CategoryImage {
        private String original_url;

        public CategoryImage() {}

        public CategoryImage(String original_url) {
            this.original_url = original_url;
        }

        public String getOriginal_url() { return original_url; }
        public void setOriginal_url(String original_url) { this.original_url = original_url; }
    }

    private Long id;
    private String name;
    private String slug;
    private String description;
    // Matches ICategory.category_image: IAttachment (frontend interface)
    private CategoryImage category_image;
    private boolean status;
}
