import { EmployeeService } from 'app/employees/employee.service';
import { PersonService } from 'app/shared/services/person.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { ExtraItemModel } from 'app/shared/models/extra-item.model';
import { PersonModel } from 'app/shared/models/person.model';
import { Employee } from 'app/employees/employee.model';
import { DatePipe } from '@angular/common';
import { ExtraItemService } from 'app/extras/extra-item.service';

@Component({
  selector: 'cb-extra-form',
  templateUrl: './extra-form.component.html',
  styleUrls: ['./extra-form.component.scss']
})
export class ExtraFormComponent implements OnInit {
  extraId: number;
  extraItem: ExtraItemModel = null;

  persons: PersonModel[] = [];
  employees: Employee[] = [];

  form = new FormGroup({
    description: new FormControl(null, [Validators.required]),
    value: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
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
    public dialog: MatDialogRef<ExtraFormComponent>,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private extraItemService: ExtraItemService,
    private personService: PersonService,
    private employeeService: EmployeeService,
  ) { }

  ngOnInit() {
    this.personService.persons().subscribe(persons => this.persons = persons);

    this.employeeService.employees({
      paginate: false
    }).subscribe(response => this.employees = response.pagination.data);
  }

  patchValue(extra: ExtraItemModel): void {
    this.extraItem = extra;

    if (this.extraItem) {
      this.form.patchValue(this.extraItem);
    }
  }

  close(extra?: ExtraItemModel): void {
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

    const body = this.getBody();

    const request = (this.extraItem && this.extraItem.id
      ? this.extraItemService.put(body)
      : this.extraItemService.post(body));
      
    let snackBarStateCharging = this.snackBar.open('Salvando...');

    request.subscribe(response => {
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

  private getBody(): ExtraItemModel {
    const extraItem: ExtraItemModel = {
      ...this.form.value,
      id: this.extraItem ? this.extraItem.id : null,
      extra_id: this.extraId,
      approval_date: this.getFormattedDate(this.form.value.approval_date),
      date: this.getFormattedDate(this.form.value.date),
      due_date: this.getFormattedDate(this.form.value.due_date),
      settlement_date: this.getFormattedDate(this.form.value.settlement_date),
    };

    if (!this.extraItem || !this.extraItem.id) {
      delete extraItem.id;
    }

    return extraItem;
  }

  private getFormattedDate(date: string | Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }
}
