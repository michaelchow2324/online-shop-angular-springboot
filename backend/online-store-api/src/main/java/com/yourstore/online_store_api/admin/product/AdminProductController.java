package com.yourstore.online_store_api.admin.product;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.yourstore.common.PagedResponse;

import java.util.List;

import jakarta.validation.Valid;

/**
 * Admin catalog APIs. Secured by {@code /api/admin/** → hasRole("ADMIN")}.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;
    private final CatalogImportService catalogImportService;

    AdminProductController(
            AdminProductService adminProductService,
            CatalogImportService catalogImportService) {
        this.adminProductService = adminProductService;
        this.catalogImportService = catalogImportService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<AdminProductDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(adminProductService.list(page, size, q, active));
    }

    /** Live catalog snapshot — does not replace a full Postgres + image backup. */
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<String> exportCatalog() {
        String csv = adminProductService.exportCatalogCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"catalog-export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csv);
    }

    /**
     * Rebuild products from CSV + image files. Match images by filename
     * ({@code image_files} / basename of {@code image_keys}). Upserts by slug, then SKU.
     */
    @PostMapping(path = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CatalogImportResult> importCatalog(
            @RequestParam("csv") MultipartFile csv,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {
        return ResponseEntity.ok(catalogImportService.importCatalog(csv, images));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminProductDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(adminProductService.get(id));
    }

    @PostMapping
    public ResponseEntity<AdminProductDTO> create(@Valid @RequestBody UpsertProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminProductDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpsertProductRequest request) {
        return ResponseEntity.ok(adminProductService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminProductDTO> setStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductStatusRequest request) {
        return ResponseEntity.ok(adminProductService.setActive(id, request.getActive()));
    }

    @PostMapping(path = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminProductDTO> addImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminProductService.addImage(id, file));
    }

    @PutMapping("/{id}/images/{imageId}/primary")
    public ResponseEntity<AdminProductDTO> setPrimaryImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(adminProductService.setPrimaryImage(id, imageId));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<AdminProductDTO> deleteImage(
            @PathVariable Long id,
            @PathVariable Long imageId) {
        return ResponseEntity.ok(adminProductService.deleteImage(id, imageId));
    }
}
