package com.yourstore.online_store_api.admin.category;

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

import jakarta.validation.Valid;

/**
 * Admin category APIs. Secured by {@code /api/admin/** → hasRole("ADMIN")}.
 */
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    AdminCategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<AdminCategoryDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(adminCategoryService.list(page, size, q, active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminCategoryDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(adminCategoryService.get(id));
    }

    @PostMapping
    public ResponseEntity<AdminCategoryDTO> create(@Valid @RequestBody UpsertCategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCategoryService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminCategoryDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody UpsertCategoryRequest request) {
        return ResponseEntity.ok(adminCategoryService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminCategoryDTO> setStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusRequest request) {
        return ResponseEntity.ok(adminCategoryService.setActive(id, request.getActive()));
    }

    @PostMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdminCategoryDTO> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminCategoryService.uploadImage(id, file));
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<AdminCategoryDTO> deleteImage(@PathVariable Long id) {
        return ResponseEntity.ok(adminCategoryService.deleteImage(id));
    }
}
