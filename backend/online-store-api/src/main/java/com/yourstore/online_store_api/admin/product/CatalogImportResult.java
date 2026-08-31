package com.yourstore.online_store_api.admin.product;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CatalogImportResult {

    private int created;
    private int updated;
    private int imagesUploaded;
    private List<String> errors = new ArrayList<>();
}
