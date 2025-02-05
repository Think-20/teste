import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevelopingComponent } from './developing.component';

@NgModule({
  declarations: [DevelopingComponent],
  imports: [
    CommonModule
  ],
  exports: [DevelopingComponent]
})
export class DevelopingModule { }
