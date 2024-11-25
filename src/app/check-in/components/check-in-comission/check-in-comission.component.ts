import { Component, ElementRef, Input, OnInit, ViewChildren, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Employee } from 'app/employees/employee.model';

@Component({
  selector: 'cb-check-in-comission',
  templateUrl: './check-in-comission.component.html',
  styleUrls: ['./check-in-comission.component.css']
})
export class CheckInComissionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title: string;
  @Input() context: string;
  @Input() department: number;
  @Input() checkInModel = new CheckInModel();
  @Input() employees: Employee[] = [];

  @ViewChildren('comission') comissionElement: ElementRef<HTMLInputElement>;
  @ViewChildren('comission2') comission2Element: ElementRef<HTMLInputElement>;

  form = new FormGroup({
    employee: new FormControl(null),
    comission: new FormControl(100),
    employee2: new FormControl(null),
    comission2: new FormControl(0),
  });

  onDestroy$ = new Subject<void>();

  add = false;

  get employeesList(): Employee[] {
    return this.employees ? this.employees.filter(x => x.department_id === this.department) : [];
  }

  get employee(): number {
    return this.context && this.checkInModel[this.context + '_employee'] ? this.checkInModel[this.context + '_employee'] : null;
  }

  get employee2(): number {
    return this.context && this.checkInModel[this.context + '_employee2'] ? this.checkInModel[this.context + '_employee2'] : null;
  }

  constructor(
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.form.valueChanges.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: (value) => {
        this.checkInModel[this.context + '_employee'] = value.employee;
        this.checkInModel[this.context + '_comission'] = value.comission;
        this.checkInModel[this.context + '_employee2'] = value.employee2;
        this.checkInModel[this.context + '_comission2'] = value.comission2;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (Object.keys(changes).includes('checkInModel')) {
      this.form.patchValue({
        employee: this.checkInModel[this.context + '_employee'],
        comission: this.checkInModel[this.context + '_comission'] || 100,
        employee2: this.checkInModel[this.context + '_employee2'],
        comission2: this.checkInModel[this.context + '_comission2'] || 0,
      });

      this.add = !!this.employee2;
    }
  }

  validateComission(): void {
    this.validateNumber(this.form.controls.comission as FormControl);

    let comission = parseFloat(this.form.controls.comission.value);

    if (isNaN(comission)) {
      comission = 0;
    }
 
    this.form.controls.comission2.patchValue(100 - comission);
  }

  validateComission2(): void {
    this.validateNumber(this.form.controls.comission2 as FormControl);

    let comission2 = parseFloat(this.form.controls.comission2.value);

    if (isNaN(comission2)) {
      comission2 = 0;
    }

    this.form.controls.comission.patchValue(100 - comission2);
  }

  validateNumber(formControl: FormControl) {
    const num = formControl.value as string;
    
    let value = parseFloat(num);

    if (isNaN(value) || !value || value < 0) {
      value = 0;
    }

    if (value > 100) {
      value = 100;
    }

    formControl.patchValue(value);
  }

  employee2Action(): void {
    this.add = !this.add;

    this.form.controls.comission.patchValue(100);
    this.form.controls.employee2.patchValue(null);
    this.form.controls.comission2.patchValue(0);
  }

  getSelectedEmployeName(id: number): string {
    const index = this.employees.findIndex(x => x.id === id);

    if (index >= 0) {
      return this.employees[index].name;
    }

    return null;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
