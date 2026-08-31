package com.yourstore.online_store_api.storage;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;

// ─── ORIGINAL IMPLEMENTATION (kept for reference) ────────────────────────────
// import io.minio.GetPresignedObjectUrlArgs;
// import io.minio.http.Method;
//
// @Service
// public class ImageStorageServiceImpl implements ImageStorageService {
//
//     private final String baseUrl;
//     private final MinioClient minioClient;
//     private final String minioBucket;
//
//     public ImageStorageServiceImpl(@Value("${storage.base-url:}") String baseUrl,
//                                    @Nullable MinioClient minioClient,
//                                    @Value("${storage.minio.bucket:}") String minioBucket) {
//         if (baseUrl == null) baseUrl = "";
//         this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
//         this.minioClient = minioClient;
//         this.minioBucket = minioBucket == null ? "" : minioBucket;
//     }
//
//     @Override
//     public String publicUrl(String storageKey) {
//         if (storageKey == null) return null;
//         if (storageKey.startsWith("/")) storageKey = storageKey.substring(1);
//         try {
//             if (minioClient != null && !minioBucket.isBlank()) {
//                 int expiry = 60 * 60; // 1 hour — WARNING: expires, bad for SEO
//                 return minioClient.getPresignedObjectUrl(
//                         GetPresignedObjectUrlArgs.builder()
//                                 .method(Method.GET)
//                                 .bucket(minioBucket)
//                                 .object(storageKey)
//                                 .expiry(expiry)
//                                 .build());
//             }
//         } catch (Exception ignored) {}
//         return baseUrl + storageKey;
//     }
// }
// ─── END ORIGINAL ─────────────────────────────────────────────────────────────

/**
 * Builds public, non-expiring URLs for storage objects.
 *
 * Why plain URLs instead of MinIO presigned URLs:
 *
 *   Presigned URLs contain a signature + expiry timestamp (e.g. 1 hour).
 *   After expiry, the URL returns 403 — breaking image links for users and
 *   causing Google to drop indexed images from search results (bad for SEO).
 *
 *   Category and product images are NOT sensitive — they are displayed to
 *   every visitor already. There is no reason to sign them.
 *
 *   Plain public URL:  https://minio.myshop.com/online-store-bucket/category/bikes.png
 *   - Never expires
 *   - CDN-cacheable
 *   - Safe for Google image indexing
 *
 * For PRIVATE files (digital downloads, invoices) use a separate service
 * that generates short-lived presigned URLs — do NOT use this service for those.
 */
@Service
public class ImageStorageServiceImpl implements ImageStorageService {

    // public-base-url is the externally accessible base URL of the public MinIO bucket.
    // Example: https://minio.myshop.com/online-store-bucket/
    // For local dev: http://localhost:9000/online-store-bucket/
    private final String publicBaseUrl;
    private final String bucket;
    private final MinioClient minioClient;

    public ImageStorageServiceImpl(
            @Value("${storage.public-base-url:}") String publicBaseUrl,
            @Value("${storage.minio.bucket:}") String bucket,
            @Nullable MinioClient minioClient) {
        if (publicBaseUrl == null) publicBaseUrl = "";
        // Ensure trailing slash so keys can be appended directly.
        this.publicBaseUrl = publicBaseUrl.endsWith("/") ? publicBaseUrl : publicBaseUrl + "/";
        this.bucket = bucket == null ? "" : bucket;
        this.minioClient = minioClient;
    }

    @Override
    public String publicUrl(String storageKey) {
        if (storageKey == null) return null;
        // Remove leading slash if present to avoid double slashes in the URL.
        if (storageKey.startsWith("/")) storageKey = storageKey.substring(1);
        // Compose plain public URL — never expires, safe for CDN and SEO crawlers.
        return publicBaseUrl + storageKey;
    }

    @Override
    public void upload(String storageKey, InputStream stream, long size, String contentType) {
        requireClient();
        if (storageKey == null || storageKey.isBlank()) {
            throw new IllegalArgumentException("Storage key is required");
        }
        if (stream == null) {
            throw new IllegalArgumentException("Image data is required");
        }
        String key = storageKey.startsWith("/") ? storageKey.substring(1) : storageKey;
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(key)
                            .stream(stream, size, -1)
                            .contentType(contentType == null || contentType.isBlank()
                                    ? "application/octet-stream"
                                    : contentType)
                            .build());
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to upload image: " + ex.getMessage(), ex);
        }
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        if (minioClient == null || bucket.isBlank()) {
            return;
        }
        String key = storageKey.startsWith("/") ? storageKey.substring(1) : storageKey;
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(key)
                            .build());
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to delete image: " + ex.getMessage(), ex);
        }
    }

    private void requireClient() {
        if (minioClient == null || bucket.isBlank()) {
            throw new IllegalStateException("Image storage is not configured");
        }
    }
}
