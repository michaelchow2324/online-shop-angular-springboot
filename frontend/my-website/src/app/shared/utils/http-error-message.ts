import { HttpErrorResponse } from "@angular/common/http";

import { ApiErrorBody } from "../interface/shop-order.interface";

/**
 * Safe message from an HTTP (or interceptor) failure.
 * Spring Security 401/403 and fetch network errors often have a null body —
 * never read {@code .message} on that without a null check.
 */
export function httpErrorMessage(
  err: unknown,
  options?: { unauthorized?: string },
): string {
  if (err instanceof HttpErrorResponse) {
    const fromBody = messageFromBody(err.error);
    if (fromBody) {
      return fromBody;
    }
    if (err.status === 0) {
      return "Cannot reach the API. Is the backend running on http://localhost:8080?";
    }
    if (err.status === 401 || err.status === 403) {
      return options?.unauthorized || "Please sign in again.";
    }
    if (err.status === 413) {
      return "Upload is too large. Try fewer or smaller images.";
    }
    if (err.status) {
      return `Request failed (${err.status})`;
    }
    return err.message || "Request failed.";
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Request failed.";
}

function messageFromBody(body: unknown): string | null {
  if (typeof body === "string" && body.trim()) {
    return body.trim();
  }
  if (body && typeof body === "object") {
    const message = (body as ApiErrorBody).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }
  return null;
}
