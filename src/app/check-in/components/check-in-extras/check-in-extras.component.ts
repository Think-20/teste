import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';
import { ExtrasService } from 'app/shared/services/extras.service';
import { CheckInExtraComponent } from '../check-in-extra/check-in-extra.component';

@Component({
  selector: 'cb-check-in-extras',
  templateUrl: './check-in-extras.component.html',
  styleUrls: ['./check-in-extras.component.css']
})
export class CheckInExtrasComponent implements OnInit {

  extras: ExtraModel[] = [];

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
        this.extras = extras;
      });
  }

  addExtra(): void {
    const modal = this.dialog.open(CheckInExtraComponent, {
      width: '500px',
    });

    modal.afterClosed().subscribe(result => {
      if (result) {
        this.extras.push(result);
      }
    });
  }

}
