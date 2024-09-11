import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../../app.api";
import { ErrorHandler } from "../error-handler.service";
import { PaymentModel } from '../models/payment.model';

@Injectable()
export class PaymentService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  paymentsByCheckInId(checkInId: number): Observable<PaymentModel[]> {
    return this.http
      .get(`${API}/payment/checkin/${checkInId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  post(payment: PaymentModel): Observable<{
    message?: string,
    object?: PaymentModel
  }> {
    return this.http
      .post(
        `${API}/payment`,
        JSON.stringify(payment),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  put(payment: PaymentModel): Observable<{
    message?: string,
    object?: PaymentModel
  }> {
    return this.http
      .put(
        `${API}/payment`,
        JSON.stringify(payment),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  delete(paymentId: number): Observable<any> {
    return this.http
      .delete(`${API}/payment/${paymentId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
