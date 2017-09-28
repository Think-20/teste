import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdSidenavModule, MdIconModule, MdButtonModule, MdToolbarModule, MdTooltipModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ROUTES } from '../app.routes';


import { SidenavComponent } from './sidenav/sidenav.component';
import { NavbarComponent } from './navbar/navbar.component';


@NgModule({
  imports: [
    CommonModule,
    MdSidenavModule,
    MdIconModule,
    MdButtonModule,
    MdToolbarModule,
    MdTooltipModule,

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
