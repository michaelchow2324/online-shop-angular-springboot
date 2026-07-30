package com.yourstore.common;

import java.time.Instant;
import java.util.List;

/**
 * Standard API error body for {@code @RestControllerAdvice} responses.
 * Interview talking point: consistent JSON error contract instead of raw stack traces.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldViolation> fieldErrors
) {
    public record FieldViolation(String field, String message) {}
}
