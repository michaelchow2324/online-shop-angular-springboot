package com.yourstore.common;

// Custom exception class for 404 errors
/**
 * Resource missing (e.g. order number not found) → HTTP 404 via {@link GlobalExceptionHandler}.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
