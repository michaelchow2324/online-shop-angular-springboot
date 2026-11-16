package com.yourstore.online_store_api.admin.category;

import org.springframework.web.multipart.MultipartFile;

import com.yourstore.common.PagedResponse;

public interface AdminCategoryService {

    PagedResponse<AdminCategoryDTO> list(int page, int size, String q, Boolean active);

    AdminCategoryDTO get(Long id);

    AdminCategoryDTO create(UpsertCategoryRequest request);

    AdminCategoryDTO update(Long id, UpsertCategoryRequest request);

    AdminCategoryDTO setActive(Long id, boolean active);

    /** Replace (or set) the single category image. */
    AdminCategoryDTO uploadImage(Long id, MultipartFile file);

    AdminCategoryDTO deleteImage(Long id);
}
