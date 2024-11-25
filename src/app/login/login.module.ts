import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { ROUTES } from './login.routes';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

import { RequestOptionsApiService } from './request-options-api.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES, { relativeLinkResolution: 'legacy' }),

    MatTableModule,
    MatProgressBarModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatChipsModule
  ],
  providers: [
    AuthGuard,
    AuthService,
    RequestOptionsApiService
  ],
  bootstrap: [LoginComponent]
})
export class LoginModule { }

