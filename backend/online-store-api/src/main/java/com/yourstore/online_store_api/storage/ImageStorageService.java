package com.yourstore.online_store_api.storage;

import java.io.InputStream;

/**
 * Abstraction for building public URLs from storage keys.
 * Allows switching implementations (MinIO, S3, CDN) without changing callers.
 */
public interface ImageStorageService {
    /**
     * Build a public URL for a storage key (or return null if key is null).
     */
    String publicUrl(String storageKey);

    /** Store an object at {@code storageKey} in the configured bucket. */
    void upload(String storageKey, InputStream stream, long size, String contentType);

    /** Remove an object if it exists. Missing keys are ignored. */
    void delete(String storageKey);
}
