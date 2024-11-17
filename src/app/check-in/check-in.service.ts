import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { MatSnackBar } from "@angular/material";
import { ErrorHandler } from "../shared/error-handler.service";
import { CheckInModel } from './check-in.model';
import { Http, RequestOptions } from "@angular/http";
import { API } from "../app.api";

@Injectable()
export class CheckInService {
constructor(private http: Http, private snackBar: MatSnackBar) {}

  checkIn(checkInId: number): Observable<CheckInModel> {
    return this.http
      .get(`${API}/checking/${checkInId}`)
      .map((response) => response.json())
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
      .post(`${API}/checking`, JSON.stringify(checkInModel), new RequestOptions())
      .map((response) => response.json())
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
      .put(`${API}/checking`, JSON.stringify(checkInModel), new RequestOptions())
      .map((response) => response.json())
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
