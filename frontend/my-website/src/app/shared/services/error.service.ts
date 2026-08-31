import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { httpErrorMessage } from "../utils/http-error-message";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  getClientErrorMessage(error: Error | null | undefined): string {
    if (error == null) {
      return "Something Went Wrong";
    }
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      return navigator.onLine
        ? error.message
          ? error.message
          : "Something Went Wrong"
        : "No Internet Connection";
    }
    return error.message ? error.message : "An error occurred";
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    return httpErrorMessage(error);
  }
}
