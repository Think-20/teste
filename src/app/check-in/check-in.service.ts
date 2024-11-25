import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ErrorHandler } from "../shared/error-handler.service";
import { CheckInModel } from './check-in.model';
import { HttpClient } from '@angular/common/http';
import { API } from "../app.api";

@Injectable()
export class CheckInService {
constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  checkIn(checkInId: number): Observable<CheckInModel> {
    return this.http
      .get<CheckInModel>(`${API}/checking/${checkInId}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  post(checkInModel: CheckInModel): Observable<{
    message?: string;
    object?: CheckInModel;
  }> {
    this.deleteReadOnlyProperties(checkInModel);

    return this.http
      .post(`${API}/checking`, JSON.stringify(checkInModel), )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  put(checkInModel: CheckInModel): Observable<{
    message?: string;
    object?: CheckInModel;
  }> {
    this.deleteReadOnlyProperties(checkInModel);

    return this.http
      .put(`${API}/checking`, JSON.stringify(checkInModel), )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  private deleteReadOnlyProperties(checkInModel: CheckInModel) {
    delete checkInModel.hash;

    delete checkInModel.extras_accept_client;
    delete checkInModel.extras_accept_client_date;

    delete checkInModel.accept_client;
    delete checkInModel.accept_client_date;

    delete checkInModel.extras_obs;
  }
}
