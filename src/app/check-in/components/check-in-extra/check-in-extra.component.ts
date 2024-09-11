import { EmployeeService } from 'app/employees/employee.service';
import { PersonService } from 'app/shared/services/person.service';
import { ExtrasService } from 'app/shared/services/extras.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';
import { PersonModel } from 'app/shared/models/person.model';
import { Employee } from 'app/employees/employee.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'cb-check-in-extra',
  templateUrl: './check-in-extra.component.html',
  styleUrls: ['./check-in-extra.component.css']
})
export class CheckInExtraComponent implements OnInit {

  @Input() checkInId: number;
  @Input() extra: ExtraModel = null;

  persons: PersonModel[] = [];
  employees: Employee[] = [];

  form = new FormGroup({
    description: new FormControl(null, [Validators.required]),
    value: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    requester: new FormControl(null, [Validators.required]),
    budget: new FormControl(null, [Validators.required]),
    approval_date: new FormControl(null, []),
    extra_commission: new FormControl(null, []),
    billing_employee_id: new FormControl(null, []),
    date: new FormControl(null, []),
    due_date: new FormControl(null, []),
    settlement_date: new FormControl(null, []),
  });

  constructor(
    public dialog: MatDialogRef<CheckInExtraComponent>,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private extrasService: ExtrasService,
    private personService: PersonService,
    private employeeService: EmployeeService,
  ) { }

  ngOnInit() {
    this.personService.persons().subscribe(persons => this.persons = persons);

    this.employeeService.employees({
      paginate: false
    }).subscribe(response => this.employees = response.pagination.data);
  }

  patchValue(extra: ExtraModel): void {
    this.extra = extra;

    if (this.extra) {
      this.form.patchValue(this.extra);
    }
  }

  close(extra?: ExtraModel): void {
    if (extra) {
      this.dialog.close(extra);

      return;
    }

    this.dialog.close();
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar>;

    const body: ExtraModel = {
      ...this.form.value,
      id: this.extra ? this.extra.id : null,
      checkin_id: this.checkInId,
      approval_date: this.datePipe.transform(this.form.value.approval_date, 'yyyy-MM-dd HH:mm:ss'),
      date: this.datePipe.transform(this.form.value.date, 'yyyy-MM-dd HH:mm:ss'),
      due_date: this.datePipe.transform(this.form.value.due_date, 'yyyy-MM-dd HH:mm:ss'),
      settlement_date: this.datePipe.transform(this.form.value.settlement_date, 'yyyy-MM-dd HH:mm:ss'),
    };

    (this.extra && this.extra.id ? this.extrasService.put(body) : this.extrasService.post(body))
      .do(() => snackBarStateCharging = this.snackBar.open('Salvando...'))
      .subscribe(response => {
        snackBarStateCharging.dismiss();

        if (response.message) {
          snackBarStateCharging = this.snackBar.open(response.message);
          
          setTimeout(() => snackBarStateCharging.dismiss(), 2000);
        }
        
        if (response.object) {
          this.close(response.object);
        }
      });
  }

}
