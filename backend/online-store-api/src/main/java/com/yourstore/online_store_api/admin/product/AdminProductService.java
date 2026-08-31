package com.yourstore.online_store_api.admin.product;

import org.springframework.web.multipart.MultipartFile;

import com.yourstore.common.PagedResponse;

public interface AdminProductService {

    PagedResponse<AdminProductDTO> list(int page, int size, String q, Boolean active);

    AdminProductDTO get(Long id);

    AdminProductDTO create(UpsertProductRequest request);

    AdminProductDTO update(Long id, UpsertProductRequest request);

    AdminProductDTO setActive(Long id, boolean active);

    AdminProductDTO addImage(Long id, MultipartFile file);

    /**
     * Same as {@link #addImage} but stores the original filename so a catalog
     * re-import can skip files that are already on the product.
     */
    AdminProductDTO addImagePreservingFilename(Long id, MultipartFile file);

    AdminProductDTO setPrimaryImage(Long id, Long imageId);

    AdminProductDTO deleteImage(Long id, Long imageId);

    /** Snapshot of the live catalog (products, categories, image keys). */
    String exportCatalogCsv();
}
