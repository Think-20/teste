import { Component, ElementRef, Input, OnInit, ViewChildren, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CheckInPeopleComponent } from '../check-in-people/check-in-people.component';
import { PersonModel } from 'app/shared/models/person.model';

@Component({
  selector: 'cb-check-in-comission',
  templateUrl: './check-in-comission.component.html',
  styleUrls: ['./check-in-comission.component.css']
})
export class CheckInComissionComponent implements OnInit, OnDestroy {

  @Input() title: string;
  @Input() context: string;
  @Input() checkInModel = new CheckInModel();
  @Input() persons: PersonModel[] = [];

  @ViewChildren('comission') comissionElement: ElementRef<HTMLInputElement>;
  @ViewChildren('comission2') comission2Element: ElementRef<HTMLInputElement>;

  form = new FormGroup({
    employee: new FormControl(null),
    comission: new FormControl(100),
    employee2: new FormControl(null),
    comission2: new FormControl(0),
  });

  onDestroy$ = new Subject<void>();

  get selectedPeople(): string {
    const index = this.persons.findIndex(x => x.id === this.form.controls.employee.value);

    if (index >= 0) {
      return this.persons[index].name;
    }

    return null;
  }

  get selectedPeople2(): string {
    const index = this.persons.findIndex(x => x.id === this.form.controls.employee2.value);

    if (index >= 0) {
      return this.persons[index].name;
    }

    return null;
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
    if (this.employee2) {
      this.form.controls.comission.patchValue(100);
      this.form.controls.employee2.patchValue(null);
      this.form.controls.comission2.patchValue(0);


      return;
    }

    const modal = this.dialog.open(CheckInPeopleComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.persons.push(result);
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
