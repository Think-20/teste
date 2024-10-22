import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';
import { ExtrasService } from 'app/shared/services/extras.service';
import { CheckInExtraComponent } from '../check-in-extra/check-in-extra.component';
import { CheckInModel } from 'app/check-in/check-in.model';

@Component({
  selector: 'cb-check-in-extras',
  templateUrl: './check-in-extras.component.html',
  styleUrls: ['./check-in-extras.component.css']
})
export class CheckInExtrasComponent implements OnInit {
  @Input() checkInModel = new CheckInModel();

  extras: ExtraModel[] = [];
  
  get valorTotalExtras(): number {
    if (!this.extras || !this.extras.length) {
      return 0;
    }

    if (this.extras.length == 1) {
      return this.extras[0].value;
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
      return this.extras[0].value;
    }

    return this.extras
      .filter(x => !!x.settlement_date)
      .map(x => x.value * (x.quantity || 1))
      .reduce((prv, current) => prv + current);
  }

  constructor(
    private dialog: MatDialog,
    private extrasService: ExtrasService
  ) { }

  ngOnInit() {
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

  openModalExtra(extra?: ExtraModel): void {
    const modal = this.dialog.open(CheckInExtraComponent, {
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
}
