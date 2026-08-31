package com.yourstore.online_store_api.admin.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.yourstore.online_store_api.product.ProductDTO.ProductImage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminProductDTO {

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminProductImage {
        private Long id;
        private String original_url;
        private String mime_type;
        private boolean primary;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AdminCategoryRef {
        private Long id;
        private String name;
        private String slug;
    }

    private Long id;
    private String name;
    private String slug;
    private String sku;
    private String description;
    private BigDecimal price;
    private ProductImage product_thumbnail;
    private boolean status;
    private List<AdminProductImage> images = new ArrayList<>();
    private List<AdminCategoryRef> categories = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
