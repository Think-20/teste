import { Component, OnInit } from '@angular/core';
import { YearsMonth } from './goals.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'cb-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  private yearsMonth: YearsMonth[] = [];
  public yearMonth: YearsMonth;
  public year = new Date().getFullYear();
  goalsForm: FormGroup;
  
  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.fillMonthYears();
  }

  createForm() {
      this.goalsForm = this.formBuilder.group({
        id: this.formBuilder.control('', []),
      })

      this.yearMonth.months.forEach(month => {
        this.goalsForm.addControl(month.name, this.formBuilder.control(null));
        this.goalsForm.controls[month.name].updateValueAndValidity();
      })
  }
  
  private fillMonthYears() {
    for (let year = 2018; year <= new Date().getFullYear(); year++) {
      const monthsOfYear = [];
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        monthsOfYear.push({ month: month, name: monthName });
      }
      this.yearsMonth.push({ year: year, months: monthsOfYear });
    }

    this.yearMonth = this.yearsMonth[this.yearsMonth.length -1]
    this.createForm();
  }

  updateYear(yearMonth: YearsMonth) {
      this.yearMonth = yearMonth;
      this.year = yearMonth.year;
      this.resetForm();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    const keyValue = String.fromCharCode(keyCode);

    if (!/^[0-9.,]$/.test(keyValue) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  addYear(increment: number) {
    this.year += increment;
    this.resetForm();
  }

  resetForm() {
    this.goalsForm.reset();
  }

  salvar() {
    console.log(this.goalsForm.value)
  }
}
