package com.yourstore.online_store_api.admin.product;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

class CatalogCsvTest {

    @Test
    void parse_stripsBomAndQuotedCommas() {
        String csv = "\uFEFFsku,name,categories\n"
                + "MB-001,\"Makeup Bag, Blue\",\"makeup-bags, keychains\"\n";

        List<Map<String, String>> rows = CatalogCsv.parse(csv);

        assertThat(rows).hasSize(1);
        assertThat(rows.get(0).get("sku")).isEqualTo("MB-001");
        assertThat(rows.get(0).get("name")).isEqualTo("Makeup Bag, Blue");
        assertThat(CatalogCsv.splitList(rows.get(0).get("categories")))
                .containsExactly("makeup-bags", "keychains");
    }

    @Test
    void basename_fromStorageKey() {
        assertThat(CatalogCsv.basename("products/21/uuid-front.jpg")).isEqualTo("uuid-front.jpg");
        assertThat(CatalogCsv.basename("blue-bear-front.jpg")).isEqualTo("blue-bear-front.jpg");
        assertThat(CatalogCsv.cell(
                Map.of("name_en", "Bag", "name", ""),
                "name", "name_en")).isEqualTo("Bag");
    }
}
