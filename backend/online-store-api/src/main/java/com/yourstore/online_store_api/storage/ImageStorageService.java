package com.yourstore.online_store_api.storage;

/**
 * Abstraction for building public URLs from storage keys.
 * Allows switching implementations (MinIO, S3, CDN) without changing callers.
 */
public interface ImageStorageService {
    /**
     * Build a public URL for a storage key (or return null if key is null).
     */
    String publicUrl(String storageKey);
}
