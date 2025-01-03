import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';
import { ExtrasService } from 'app/extras/extras.service';
import { ExtraFormComponent } from '../extra-form/extra-form.component';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Job } from 'app/jobs/job.model';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { Employee } from 'app/employees/employee.model';
import { EmployeeService } from 'app/employees/employee.service';
import { AuthService } from 'app/login/auth.service';

@Component({
  selector: 'cb-extras-grid',
  templateUrl: './extras-grid.component.html',
  styleUrls: ['./extras-grid.component.scss']
})
export class ExtrasGridComponent implements OnInit {
  @Input() job = new Job();
  @Input() checkInModel = new CheckInModel();
  @Input() employees: Employee[] = [];

  employeeId: number;

  acceptList = [0, 1, 2];

  extras: ExtraModel[] = [];

  obs$ = new Subject<boolean>();
  
  get valorTotalExtras(): number {
    if (!this.extras || !this.extras.length) {
      return 0;
    }

    if (this.extras.length == 1) {
      return this.extras[0].value * (this.extras[0].quantity || 1);
    }

    return this.extras
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }

  get valorTotalExtrasRecebido(): number {
    if (!this.extras || !this.extras.length) {
      return 0;
    }

    if (this.extras.length == 1) {
      return this.extras[0].value * (this.extras[0].quantity || 1);
    }

    const extras = this.extras.filter(x => !!x.settlement_date);

    if (!extras || extras.length <= 0) {
      return 0;
    }

    return extras
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }

  constructor(
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    readonly authService: AuthService,
    private extrasService: ExtrasService,
    private employeeService: EmployeeService,
  ) {
    this.employeeId = authService.currentUser().employee.id;
  }

  ngOnInit() {
    this.loadEmployees();

    this.obs$
      .debounceTime(1000)
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.checkInModel.extras_accept_client = 2;
        this.saveObs();
      });
    
    this.loadExtras();
  }

  private loadEmployees(): void {
    this.employeeService.employees({paginate: false}).subscribe((response) => {
      this.employees = response.pagination.data;
    });
  }

  private loadExtras(): void {
    this.extrasService.extras()
      .subscribe(extras => {
        if (extras && extras.length > 0 && this.checkInModel.id) {
          this.extras = extras.filter(x => x.checkin_id === this.checkInModel.id);
        }
      });
  }

  getClientName() {
    if (this.job && this.job.agency) {
      return this.job.agency.fantasy_name;
    }

    if (this.job && this.job.client) {
      return this.job.client.fantasy_name;
    }
    
    return '-';
  }

  getAcceptLabel(type: "client" | "approval", accept: number): void {
    const object = {
      'client': {
        0: 'Aguardando aceite do cliente',
        1: 'Aceito pelo cliente',
        2: 'Recusado pelo cliente',
      },
      'approval': {
        0: 'Aguardando aprovação do atendente',
        1: 'Aprovado pelo atendente',
        2: 'Recusado pelo atendente',
      },
    }

    return object[type][accept];
  }

  updateAlertDateApproval(): void {
    this.checkInModel.approval_employee_id = this.employeeId;
    this.checkInModel.approval_date = this.getCurrentDate();
  }

  updateAlertDateAcceptClient(): void {
    if (this.job && this.job.checkin) {
      this.checkInModel.extras_accept_client_date = this.getCurrentDate();

      // let snackBarStateCharging = this.snackBar.open('Salvando...');

      // this.checkInService.resetAcceptClient(
      //   this.checkInModel.id,
      //   this.checkInModel.accept_client_date,
      //   this.checkInModel.accept_client,
      // ).subscribe({
      //   next: () => snackBarStateCharging.dismiss(),
      //   error: () => snackBarStateCharging.dismiss(),
      // });
    }
  }

  private getCurrentDate(): string {
    return this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }

  getEmployeeName(id: number): string {
    if (!id) {
      return '';
    }

    const index = this.employees.findIndex(x => x.id == id);

    if (index >= 0) {
      return this.employees[index].name;
    }
    
    return '';
  }

  openModalExtra(extra?: ExtraModel): void {
    if (!this.checkInModel.id) {
      return;
    }

    const modal = this.dialog.open(ExtraFormComponent, {
      width: '500px',
    });

    modal.componentInstance.checkInId = this.checkInModel.id;
    modal.componentInstance.patchValue(extra);

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.checkInModel.extras_accept_client = 0;

        this.loadExtras();
      }
    });
  }

  edit(extra: ExtraModel): void {
    this.openModalExtra(extra);
  }

  delete(extra: ExtraModel): void {
    this.extrasService.delete(extra.id)
      .subscribe(() => {
        this.checkInModel.extras_accept_client = 0;

        this.loadExtras();
      });
  }

  sendEmail(): void {
    if (!this.checkInModel.id) {
      return;
    }

    let snackBarStateCharging = this.snackBar.open('Enviando e-mail...');

    this.extrasService.sendEmail(this.checkInModel.id).subscribe(() => {
      snackBarStateCharging.dismiss();

      snackBarStateCharging = this.snackBar.open('E-mail enviado!');
          
      setTimeout(() => snackBarStateCharging.dismiss(), 3000);
    });
  }

  changeObs(): void {
    this.obs$.next(true);
  }

  private saveObs(): void {
    this.extrasService
      .saveObs(this.checkInModel.id, this.checkInModel.extras_obs)
      .subscribe();
  }
}
