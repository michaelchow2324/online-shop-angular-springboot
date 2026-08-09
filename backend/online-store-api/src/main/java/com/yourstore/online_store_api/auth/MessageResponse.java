package com.yourstore.online_store_api.auth;

/**
 * Generic success body for public auth actions that must not leak account state.
 */
public record MessageResponse(String message) {
}
