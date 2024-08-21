import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NG_LOCK_CONTEXT } from './ng-lock-token';
import { ngUnlock } from './ng-lock.decorator';


@Injectable()
export class NgLockInterceptorService implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      finalize(() => {
        const context = req.context.get(NG_LOCK_CONTEXT);
        if (typeof context === 'function') {
          ngUnlock(context, 'HTTP response')
        }
      })
    );
  }

}
