import { DatePipe } from '@angular/common';
import { PaymentService } from './../../../shared/services/payment.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';
import { PaymentModel } from 'app/shared/models/payment.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cb-check-in-payment-form',
  templateUrl: './check-in-payment-form.component.html',
  styleUrls: ['./check-in-payment-form.component.css']
})
export class CheckInPaymentFormComponent implements OnInit, OnDestroy {
  @Input() checkInId: number;
  @Input() baseValue: number;
  @Input() paymentModel: PaymentModel;

  form = new FormGroup({
    description: new FormControl(null, [Validators.required]),
    percentage: new FormControl(null, []),
    value: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    order_date: new FormControl(null, [Validators.required]),
    payment_date: new FormControl(null, []),
  });

  private onDestroy$ = new Subject<void>();

  constructor(
    private datePipe: DatePipe,
    private snackBar: MatSnackBar,
    private paymentService: PaymentService,
    public dialog: MatDialogRef<CheckInPaymentFormComponent>,
  ) { }

  ngOnInit(): void {
    this.form.controls.value.valueChanges.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: result => {
        let value = result ? result : 0;

        const percentage = parseFloat(((value * 100) / this.baseValue).toFixed(2));

        this.form.controls.percentage.patchValue(percentage);
      }
    });
  }

  patchValue(payment: PaymentModel): void {
    this.paymentModel = payment;

    if (this.paymentModel) {
      this.form.patchValue(this.paymentModel);
    }
  }


  close(paymentModel?: PaymentModel): void {
    if (paymentModel) {
      this.dialog.close(paymentModel);

      return;
    }

    this.dialog.close();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const body: PaymentModel = {
      ...this.form.value,
      order_date: this.datePipe.transform(this.form.value.order_date, 'yyyy-MM-dd HH:mm:ss'),
      payment_date: this.datePipe.transform(this.form.value.payment_date, 'yyyy-MM-dd HH:mm:ss'),
      id: this.paymentModel && this.paymentModel.id ? this.paymentModel.id : null,
      checkin_id: this.checkInId,
    };

    let snackBarStateCharging: MatSnackBarRef<SimpleSnackBar> = null;

    (this.paymentModel && this.paymentModel.id ? this.paymentService.put(body) : this.paymentService.post(body))
      .do(() => snackBarStateCharging = this.snackBar.open('Salvando...'))
      .subscribe({
        next: (response) => {
          snackBarStateCharging.dismiss();

          if (response.message) {
            snackBarStateCharging = this.snackBar.open(response.message);
            
            setTimeout(() => snackBarStateCharging.dismiss(), 2000);
          }

          if (response.object) {
            this.close(response.object);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
