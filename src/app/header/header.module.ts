import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatIconModule, MatButtonModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ROUTES } from '../app.routes';


import { SidenavComponent } from './sidenav/sidenav.component';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTooltipModule,

    RouterModule.forRoot(ROUTES)
  ],
  exports: [
    BrowserAnimationsModule,
    SidenavComponent,
    NavbarComponent
  ],
  declarations: [
    SidenavComponent,
    NavbarComponent
  ]
})
export class HeaderModule { }
