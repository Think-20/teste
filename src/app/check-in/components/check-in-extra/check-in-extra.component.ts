import { ExtrasService } from 'app/shared/services/extras.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import { ExtraModel } from 'app/shared/models/extra.model';

@Component({
  selector: 'cb-check-in-extra',
  templateUrl: './check-in-extra.component.html',
  styleUrls: ['./check-in-extra.component.css']
})
export class CheckInExtraComponent implements OnInit {

  @Input() checkInId: number;

  form = new FormGroup({
    description: new FormControl(null, [Validators.required]),
    value: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    requester: new FormControl(null, [Validators.required]),
    budget: new FormControl(null, [Validators.required]),
  });

  constructor(
    public dialog: MatDialogRef<CheckInExtraComponent>,
    private snackBar: MatSnackBar,
    private extrasService: ExtrasService,
  ) { }

  ngOnInit() {
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

    this.extrasService.save({ ...this.form.value, checkin_id: this.checkInId })
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
