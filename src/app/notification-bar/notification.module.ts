import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule, MatCardModule, MatButtonModule, MAT_DATE_LOCALE } from '@angular/material';
import { NotificationItemComponent } from '../notification-bar/notification-item/notification-item.component';

@NgModule({
  imports: [
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    CommonModule,
  ],
  exports: [
    NotificationItemComponent
  ],
  declarations: [
    NotificationItemComponent
  ],
  providers: [
    DatePipe,
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'},
  ],
})
export class NotificationModule { }
