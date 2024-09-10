import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgLockModule } from 'projects/ng-lock/src/public-api';

if (environment.production) {
  enableProdMode();
}


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(NgLockModule),
    provideHttpClient(withInterceptorsFromDi())
  ]
});