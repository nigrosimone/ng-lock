import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { NgLockInterceptorService } from "./ng-lock-interceptor.service";

export function provideNgLock() {
    const providers: EnvironmentProviders[] = [makeEnvironmentProviders([{
        provide: HTTP_INTERCEPTORS,
        useClass: NgLockInterceptorService,
        multi: true,
    }])];
    return providers;
}
