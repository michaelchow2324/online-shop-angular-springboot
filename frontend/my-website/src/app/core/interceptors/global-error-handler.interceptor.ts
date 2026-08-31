import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable, inject } from "@angular/core";

import { Observable, catchError, throwError } from "rxjs";

import { LoggingService } from "../../shared/services/logging.service";
import { NotificationService } from "../../shared/services/notification.service";
import { httpErrorMessage } from "../../shared/utils/http-error-message";

@Injectable()
export class GlobalErrorHandlerInterceptor implements HttpInterceptor {
  private logger = inject(LoggingService);
  private notifier = inject(NotificationService);

  intercept<T>(
    request: HttpRequest<T>,
    next: HttpHandler,
  ): Observable<HttpEvent<T>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = httpErrorMessage(error);
        this.logger.logError(errorMessage);
        // 401/403 often have an empty body; the page already shows a sign-in message.
        if (error.status !== 401 && error.status !== 403) {
          this.notifier.showError(errorMessage);
        }
        return throwError(() => error);
      }),
    );
  }
}
