package com.yourstore.online_store_api.product;

import java.math.BigDecimal;

import com.yourstore.online_store_api.product.ProductDTO.ProductImage;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductDetailDTO {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal salePrice;
    private boolean isOnSale;
    private ProductImage[] images;
    private ProductImage thumbnail;
    private String brand;
    private String[] categories;
    private int stock;
    private String sku;
    private String[] attributes;
    private ProductDTO[] relatedProducts;
    private ProductDTO[] crossSellProducts;
    private boolean status;

}
