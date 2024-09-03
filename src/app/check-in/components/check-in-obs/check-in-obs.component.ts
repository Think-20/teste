import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cb-check-in-obs',
  templateUrl: './check-in-obs.component.html',
  styleUrls: ['./check-in-obs.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckInObsComponent),
      multi: true,
    },
  ],
})
export class CheckInObsComponent implements ControlValueAccessor {
  @Input() borderBottom = false;
  
  value: string = '';

  writeValue(value: string): void {    
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onChange: any = () => {};

  onTouched: any = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.onTouched();
  }

}
