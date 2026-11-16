package com.yourstore.online_store_api.admin.category;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CategoryStatusRequest {

    @NotNull(message = "active is required")
    private Boolean active;
}
