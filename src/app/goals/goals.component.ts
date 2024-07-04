import { Component, OnInit } from '@angular/core';
import { Goal, YearsMonth } from './goals.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GoalsService } from './goals.service';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';

@Component({
  selector: 'cb-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  public yearsMonth: YearsMonth[] = [];
  public yearMonth: YearsMonth;
  public year = new Date().getFullYear();
  public goals: Goal[] = [];
  public goalsForm: FormGroup;
  public readonly maxYear = new Date().getFullYear();
  public readonly minYear = 2018;

  constructor(private formBuilder: FormBuilder, private goalService: GoalsService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fillMonthYears();
    this.loadGoals();
  }


  loadGoals() {
    let snackBar = this.snackBar.open('Carregando metas...')
    this.goalService.getGoals().subscribe(response => {
      this.goals = response;
      this.updateValuesFormYearsMonth();
      snackBar.dismiss();
    },
    () =>  snackBar.dismiss())
  }

  updateGoal(goal: Goal) {
    this.goalService.updateGoals(goal).subscribe(response => {
      this.snackBar.open(response.message)
      this.dismissSnackBar();
    })
  }

  createGoal(goal: Goal) {
    this.goalService.postGoals(goal).subscribe(response => {
      this.snackBar.open(response.message)
      this.dismissSnackBar();
    })
  }

  dismissSnackBar() {
    Observable.timer(1000).subscribe(() => this.snackBar.dismiss())
  }

  updateValuesFormYearsMonth() {
    this.yearMonth.months.forEach(month => {
      const matchingGoal = this.getGoal(month.year, month.month);

      if (matchingGoal) {
        const { id, value_internal, value_external, expected_value_external, expected_value_internal } = matchingGoal;
        Object.assign(month, { id, value_internal, value_external, expected_value_external, expected_value_internal });
      }
    });

    this.createForm();
  }

  getGoal(year: number, month: number): Goal {
    return this.goals.find(goal => goal.year === year && goal.month === month);
  }

  createForm() {
    this.goalsForm = this.formBuilder.group({})

    this.yearMonth.months.forEach(month => {
      const monthId = month.month;
      
      this.goalsForm.addControl(monthId.toString(), this.formBuilder.control(month.value_internal));
      this.goalsForm.addControl(monthId.toString() + "external", this.formBuilder.control(month.value_external));

      this.goalsForm.addControl(monthId.toString() + 'espected', this.formBuilder.control(month.expected_value_external));
      this.goalsForm.addControl(monthId.toString() + 'espected' + 'internal', this.formBuilder.control(month.expected_value_internal));

      const valueInternalControl = this.goalsForm.controls[monthId];
      const valueExternalControl = this.goalsForm.controls[monthId.toString() + 'external'];
        
      const expectedValueExternal = this.goalsForm.controls[monthId.toString() + 'espected'];
      const expectedValueInternal = this.goalsForm.controls[monthId.toString() + 'espected' + 'internal'];

      valueInternalControl.updateValueAndValidity();
      expectedValueExternal.updateValueAndValidity();

      valueExternalControl.updateValueAndValidity();
      expectedValueInternal.updateValueAndValidity();

      valueInternalControl.valueChanges
        .do(() => {
          console.log('Aguarde...')
        })
        .debounceTime(1000)
        .subscribe(value => {
          if (!value) {
            this.snackBar.open("Por favor informe a meta de aprovados - interno!")
            value.setValue(month.value_internal, { emitEvent: false });
            this.dismissSnackBar();
            return;
          }
          this.createUpdateGoal(month, valueInternalControl.value, expectedValueExternal.value, valueExternalControl.value, expectedValueInternal.value);
        })

        expectedValueExternal.valueChanges
          .do(() => {
            console.log('Aguarde...')
          })
          .debounceTime(1000)
          .subscribe(value => {
            if (!value) {
              this.snackBar.open("Por favor informe a meta de jobs externo!")
              expectedValueExternal.setValue(month.expected_value_external, { emitEvent: false });
              this.dismissSnackBar();
              return;
            }
            
            this.createUpdateGoal(month, valueInternalControl.value, expectedValueExternal.value, valueExternalControl.value, expectedValueInternal.value);
        })

        valueExternalControl.valueChanges.do(() => {
            console.log('Aguarde...')
          })
          .debounceTime(1000)
          .subscribe(value => {
            if (!value) {
              this.snackBar.open("Por favor informe a meta de aprovados - externo!")
              expectedValueExternal.setValue(month.value_external, { emitEvent: false });
              this.dismissSnackBar();
              return;
            }
            
            this.createUpdateGoal(month, valueInternalControl.value, expectedValueExternal.value, valueExternalControl.value, expectedValueInternal.value);
        })
        expectedValueInternal.valueChanges.do(() => {
          console.log('Aguarde...')
          })
          .debounceTime(1000)
          .subscribe(value => {
            if (!value) {
              this.snackBar.open("Por favor informe a meta de jobs interno!")
              expectedValueExternal.setValue(month.expected_value_internal, { emitEvent: false });
              this.dismissSnackBar();
              return;
            }
            
          this.createUpdateGoal(month, valueInternalControl.value, expectedValueExternal.value, valueExternalControl.value, expectedValueInternal.value);
      })
    })
  }

  createUpdateGoal(goal: Goal, valueInternal: number, expectedValueExternal: number, valueExternal: number, expectedValueInternal: number) {
    goal.value_internal = valueInternal;
    goal.expected_value_external = expectedValueExternal;

    goal.value_external = valueExternal;
    goal.expected_value_internal = expectedValueInternal;

    console.log(goal)
    if (goal.id)
      this.updateGoal(goal);
    else
      this.createGoal(goal);
  }

  getValueByMonthAndYear(month: number): Goal {
    const goal = this.goals.find(x => x.year === this.year && x.month == month);

    if (!goal) {
      return;
    }

    return goal;
  }

  private fillMonthYears() {
    for (let year = this.minYear; year <= this.maxYear; year++) {
      const monthsOfYear = [];
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        monthsOfYear.push({ month: month, month_name: monthName, year: year, id: null, value: null });
      }
      this.yearsMonth.push({ year: year, months: monthsOfYear });
    }

    this.yearMonth = this.yearsMonth[this.yearsMonth.length - 1]
  }

  updateYear(yearMonth: YearsMonth) {
    this.yearMonth = yearMonth;
    this.year = yearMonth.year;
    this.updateDate();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    const keyValue = String.fromCharCode(keyCode);

    if (!/^[0-9.,]$/.test(keyValue) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  addYear(increment: number) {
    var yearAux = this.year;
    yearAux += increment;

    if (yearAux > this.maxYear || yearAux < this.minYear) {
      return;
    }

    this.year += increment;
    this.yearMonth = this.yearsMonth.find(x => x.year === this.year);
    this.updateDate();
  }

  updateDate() {
    this.updateValuesFormYearsMonth();
  }

  resetForm() {
    this.goalsForm.reset();
  }

  salvar() {
    console.log(this.goalsForm.value)
  }

}
