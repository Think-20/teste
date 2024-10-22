import { CheckInModel } from "app/check-in/check-in.model";
import { AfterViewInit, Component, Input, ViewChild } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { CheckInService } from "./check-in.service";
import { EmployeeService } from 'app/employees/employee.service';
import { Employee } from 'app/employees/employee.model';
import { CheckInContactInfoComponent } from './components/check-in-contact-info/check-in-contact-info.component';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { CheckInExtrasComponent } from './components/check-in-extras/check-in-extras.component';

@Component({
  selector: "cb-check-in",
  templateUrl: "./check-in.component.html",
  styleUrls: ["./check-in.component.css"],
})
export class CheckInComponent implements AfterViewInit {
  @ViewChild('contactInfo', { static: false }) contactInfo: CheckInContactInfoComponent;

  @ViewChild('extras', { static: false }) extras: CheckInExtrasComponent;

  @Input() job: Job = new Job();

  checkInModel: CheckInModel = new CheckInModel();
  employees: Employee[] = [];

  get valorTotalExtrasRecebido(): number {
    if (!this.extras) {
      return 0;
    }

    return this.extras.valorTotalExtrasRecebido;
  }

  constructor(
    private snackBar: MatSnackBar,
    private checkInService: CheckInService,
    private employeeService: EmployeeService,
  ) {}

  ngAfterViewInit() {
    this.loadEmployees();
    this.getCheckInModel();
  }

  private getCheckInModel(): void {
    if (this.job.checkin) {
      this.checkInModel = this.job.checkin;

      return;
    }

    this.checkInModel.job_id = this.job.id;

    this.save();
  }

  private loadEmployees(): void {
    this.employeeService.employees({paginate: false}).subscribe((response) => {
      this.employees = response.pagination.data;
    });
  }

  save(): void {
    this.contactInfo.save();

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;
    
    (this.job.checkin
      ? this.checkInService.put(this.checkInModel)
      : this.checkInService.post(this.checkInModel)
    ).do(() => snackBarStateCharging = this.snackBar.open('Salvando...')).subscribe({
      next: (response) => {
        snackBarStateCharging.dismiss();

        if (response.object) {
          snackBarStateCharging = this.snackBar.open(response.message);
            
          setTimeout(() => snackBarStateCharging.dismiss(), 3000);

          this.checkInModel = response.object;

          this.job.checkin = this.checkInModel;
        }
      },
    });
  }
}
