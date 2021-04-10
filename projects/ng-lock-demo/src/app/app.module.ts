import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { NgLockModule } from '../../../ng-lock/src/public-api';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    NgLockModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
