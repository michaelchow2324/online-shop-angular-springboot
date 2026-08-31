package com.yourstore.online_store_api.admin.product;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpsertProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    /** Optional. Generated from the name when blank. */
    private String slug;

    private String sku;

    private String description;

    /** Traditional Chinese name shown when the shop language is 繁體中文. */
    private String nameZh;

    /** Traditional Chinese description. */
    private String descriptionZh;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Price must be non-negative")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal price;

    /** Defaults to true on create when omitted. */
    private Boolean active;

    private List<Long> categoryIds = new ArrayList<>();
}
