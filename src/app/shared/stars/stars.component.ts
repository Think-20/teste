import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'cb-stars',
  templateUrl: './stars.component.html',
  styleUrls: ['./stars.component.css']
})
export class StarsComponent implements OnInit {

  @Input('label') label: string = ''
  @Input('readonly') readonly: boolean = false
  rates: number[] = [1,2,3,4,5]
  @Input('rate') rate: number = 0
  @Input('input') input: FormControl = new FormControl()
  temp: number

  constructor() { }

  ngOnInit() {
  }

  changeRate(newValue: number) {
    if(this.readonly) return

    this.rate = newValue
    
    if(newValue === 0) {
      this.input.setValue('') 
    } else {
      this.input.setValue((this.rate - 1).toString())
    }
  }

  mouseEnter(index: number): void {
    if(this.readonly) return
    this.temp = this.rate
    this.changeRate(index + 1)
  }

  mouseLeave(): void {
    if(this.readonly) return
    if(this.temp !== null && this.rate != 0) this.changeRate(this.temp)
  }

  defineRate(index: number) {
    if(this.readonly) return
    /* Zerar valor do rate, caso a estrela clicada já tenha valor */
    if(this.temp === index + 1) {
      this.changeRate(0)
    } else {
    this.changeRate(index + 1)
      this.temp = null
    }
  }

}
