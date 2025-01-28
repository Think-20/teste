import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraItemModel } from 'app/shared/models/extra-item.model';
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
import { ExtraModel } from 'app/shared/models/extra.model';

@Component({
  selector: 'cb-extras-grid',
  templateUrl: './extras-grid.component.html',
  styleUrls: ['./extras-grid.component.scss']
})
export class ExtrasGridComponent implements OnInit {
  @Input() job = new Job();
  @Input() last = false;
  @Input() index = 0;
  @Input() extra = new ExtraModel();
  @Input() checkInModel = new CheckInModel();
  @Input() employees: Employee[] = [];

  employeeId: number;

  acceptList = [0, 1, 2];

  obs$ = new Subject<boolean>();
  
  get items(): ExtraItemModel[] {
    return this.extra
      && this.extra.extra_items
      && this.extra.extra_items.length
      ? this.extra.extra_items
      : [];
  }

  get valorTotalExtras(): number {
    if (!this.items || !this.items.length) {
      return 0;
    }

    if (this.items.length == 1) {
      return this.items[0].value * (this.items[0].quantity || 1);
    }

    return this.items
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }

  get valorTotalExtrasRecebido(): number {
    if (!this.items || !this.items.length) {
      return 0;
    }

    if (this.items.length == 1) {
      return this.items[0].value * (this.items[0].quantity || 1);
    }

    const items = this.items.filter(x => !!x.settlement_date);

    if (!items || items.length <= 0) {
      return 0;
    }

    return items
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
        this.saveObs();
      });
  }

  private loadEmployees(): void {
    this.employeeService.employees({paginate: false}).subscribe((response) => {
      this.employees = response.pagination.data;
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
    this.extra.approval_date = this.getCurrentDate();
  }

  updateAlertDateAcceptClient(): void {
    this.extra.accept_client_date = this.getCurrentDate();

    let snackBarStateCharging = this.snackBar.open('Salvando...');

    this.extrasService.resetAcceptClient(
      this.extra.id,
      this.extra.accept_client,
      this.extra.accept_client_date,
    ).subscribe({
      next: () => snackBarStateCharging.dismiss(),
      error: () => snackBarStateCharging.dismiss(),
    });
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

  openModalExtra(item?: ExtraItemModel): void {
    const modal = this.dialog.open(ExtraFormComponent, {
      width: '500px',
    });

    modal.componentInstance.extra = this.extra;
    modal.componentInstance.patchValue(item);

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.extra.accept_client = 0;
      }
    });
  }

  edit(extra: ExtraItemModel): void {
    this.openModalExtra(extra);
  }

  delete(extra: ExtraItemModel): void {
    this.extrasService.delete(extra.id)
      .subscribe(() => {
        this.extra.accept_client = 0;
      });
  }

  sendEmail(): void {
    if (!this.checkInModel.client_email) {
      return;
    }

    let snackBarStateCharging = this.snackBar.open('Enviando e-mail...');

    this.extrasService.sendEmail(this.extra.id).subscribe(() => {
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
      .saveObs(this.extra.id, this.extra.obs)
      .subscribe();
  }
}
