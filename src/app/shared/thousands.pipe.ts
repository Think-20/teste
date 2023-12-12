import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousands'
})
export class ThousandsPipe implements PipeTransform {
  transform(value: number): string {
    if (value >= 1000) {
      const formattedNumber = (value / 1000).toFixed(3);
      const trimmedNumber = formattedNumber.replace(/\.?0+$/, '');
      return trimmedNumber + 'k';
    } else {
      return value.toString();
    }
  }
}