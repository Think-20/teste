import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, RequestOptions } from '@angular/http';
import { RouterModule } from '@angular/router';

import { 
  MD_PLACEHOLDER_GLOBAL_OPTIONS,
  MatTableModule, MatProgressBarModule, MatCardModule, MatInputModule, MatSelectModule, 
  MatButtonModule, MatIconModule, MatTabsModule, MatAutocompleteModule, MatChipsModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { ROUTES } from './login.routes';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

import { RequestOptionsApiService } from './request-options-api.service';

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),

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
    {provide: RequestOptions, useClass: RequestOptionsApiService}
  ],
  bootstrap: [LoginComponent]
})
export class LoginModule { }

