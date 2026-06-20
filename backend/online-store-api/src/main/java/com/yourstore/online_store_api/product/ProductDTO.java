package com.yourstore.online_store_api.product;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    
    /**
     * Nested object matching the frontend's IAttachment interface.
     * The template reads `product.product_thumbnail.original_url` to display the image.
     */
    public static class ProductImage {
        private Long id;
        private String original_url;
        private String mime_type;

        public ProductImage() {}

        public ProductImage(String original_url) {
            this.original_url = original_url;
        }

        public ProductImage(Long id, String original_url, String mime_type) {
            this.id = id;
            this.original_url = original_url;
            this.mime_type = mime_type;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getOriginal_url() { return original_url; }
        public void setOriginal_url(String original_url) { this.original_url = original_url; }

        public String getMime_type() { return mime_type; }
        public void setMime_type(String mime_type) { this.mime_type = mime_type; }
    }

    private Long id;
    private String name;
    private String slug;
    private String sku;
    private String description;
    private BigDecimal price;
      // Matches IProduct.product_thumbnail: IAttachment (frontend interface)
    private ProductImage product_thumbnail;
    private boolean status;

    /** Theme templates read sale_price for display; same as price until sales are implemented. */
    @JsonProperty("sale_price")
    public BigDecimal getSalePrice() {
        return price;
    }

}
