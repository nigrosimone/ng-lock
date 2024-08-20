import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgLockInterceptorService } from './ng-lock-interceptor.service';

@NgModule({
  providers: [
    NgLockInterceptorService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgLockInterceptorService,
      multi: true,
    },
  ]
})
export class NgLockModule { }
