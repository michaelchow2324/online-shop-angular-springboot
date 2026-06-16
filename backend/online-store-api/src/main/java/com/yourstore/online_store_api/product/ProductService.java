package com.yourstore.online_store_api.product;

import com.yourstore.common.PagedResponse;

public interface ProductService {
    PagedResponse<ProductDTO> findProducts(int page, int size, String sort, String locale);
    PagedResponse<ProductDTO> findProductsByCategorySlug(String slug, int page, int size, String sort, String locale);
    ProductDetailDTO findProductBySlug(String slug, String locale);
}
