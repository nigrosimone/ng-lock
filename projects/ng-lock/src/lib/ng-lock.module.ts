import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgLockInterceptorService } from './ng-lock-interceptor.service';
import { NgLockDirective } from './ng-lock.directive';

@NgModule({
  imports: [NgLockDirective],
  exports: [NgLockDirective],
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
