import { PaymentModel } from './../../../shared/models/payment.model';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'cb-check-in-payment',
  templateUrl: './check-in-payment.component.html',
  styleUrls: ['./check-in-payment.component.css']
})
export class CheckInPaymentComponent {

  @Input() paymentModel = new PaymentModel();

}
