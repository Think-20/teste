import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'cb-check-in-other-cnpj',
  templateUrl: './check-in-other-cnpj.component.html',
  styleUrls: ['./check-in-other-cnpj.component.scss']
})
export class CheckInOtherCnpjComponent {
  @ViewChild('inputName', { static: false }) name: ElementRef<HTMLInputElement>;

  @Input() form: FormGroup;
  @Output() remove = new EventEmitter<boolean>();

  focusName(): void {
    this.name.nativeElement.focus();
  }

  delete(): void {
    this.remove.emit(true);
  }
}
