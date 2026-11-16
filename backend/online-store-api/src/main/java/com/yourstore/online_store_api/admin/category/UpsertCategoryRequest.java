package com.yourstore.online_store_api.admin.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpsertCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    /** Optional. Generated from the name when blank. */
    private String slug;

    /** Traditional Chinese name shown when the shop language is 繁體中文. */
    private String nameZh;

    /** Display order on the storefront (lower = earlier). Defaults to 100 on create. */
    private Integer sortOrder;

    /** Defaults to true on create when omitted. */
    private Boolean active;
}
