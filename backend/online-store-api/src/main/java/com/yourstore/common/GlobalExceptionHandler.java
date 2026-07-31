package com.yourstore.common;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

// RestControllerAdvice: Every error thrown from @RestController will be handled by this class
/**
 * Global REST exception handler.
 *
 * Without this, service {@code IllegalArgumentException}s become generic 500s,
 * and {@code @Valid} failures return Spring's default validation payload.
 *
 * Maps guide 01 order errors:
 * - empty items / bad email → MethodArgumentNotValidException → 400
 * - unknown/inactive product, non-CA → IllegalArgumentException → 400
 * - missing order on GET → NotFoundException → 404
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        List<ApiError.FieldViolation> fields = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> new ApiError.FieldViolation(err.getField(), err.getDefaultMessage()))
                .toList();

        return build(HttpStatus.BAD_REQUEST, "Validation failed", request, fields); //return a 400 response with the validation errors
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleBadRequest(IllegalArgumentException ex, WebRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request, List.of());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(NotFoundException ex, WebRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request, List.of()); //return a 404 response with the not found error
    }

    private ResponseEntity<ApiError> build(
            HttpStatus status,
            String message,
            WebRequest request,
            List<ApiError.FieldViolation> fieldErrors
    ) {
        String path = request.getDescription(false).replace("uri=", "");
        ApiError body = new ApiError(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                fieldErrors
        );
        return ResponseEntity.status(status).body(body);
    }
}
