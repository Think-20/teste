import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';
import { ExtrasService } from 'app/extras/extras.service';
import { ExtraRowComponent } from '../extra-row/extra-row.component';
import { CheckInModel } from 'app/check-in/check-in.model';
import { Job } from 'app/jobs/job.model';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'cb-extras-grid',
  templateUrl: './extras-grid.component.html',
  styleUrls: ['./extras-grid.component.css']
})
export class ExtrasGridComponent implements OnInit {
  @Input() job = new Job();
  @Input() checkInModel = new CheckInModel();

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
    private snackBar: MatSnackBar,
    private extrasService: ExtrasService,
  ) { }

  ngOnInit() {
    this.obs$
      .debounceTime(1000)
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.saveObs();
      });
    
    this.loadExtras();
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

  validateAcceptClient(event: PointerEvent): void {
    event.preventDefault();
  }

  openModalExtra(extra?: ExtraModel): void {
    if (!this.checkInModel.id) {
      return;
    }

    const modal = this.dialog.open(ExtraRowComponent, {
      width: '500px',
    });

    modal.componentInstance.checkInId = this.checkInModel.id;
    modal.componentInstance.patchValue(extra);

    modal.afterClosed().subscribe(result => {
      if (result) {
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
        this.loadExtras();
      });
  }

  sendEmail(): void {
    if (!this.checkInModel.id) {
      return;
    }

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    this.extrasService.sendEmail(this.checkInModel.id)
      .do(() => snackBarStateCharging = this.snackBar.open('Enviando e-mail...'))
      .subscribe(() => {
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
