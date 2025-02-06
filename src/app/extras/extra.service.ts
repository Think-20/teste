import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs/Observable";
import { API } from "../app.api";
import { ErrorHandler } from "../shared/error-handler.service";
import { ExtraModel } from 'app/shared/models/extra.model';

@Injectable()
export class ExtraService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  get(): Observable<ExtraModel[]> {
    return this.http
      .get(`${API}/extra`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  resetAcceptClient(
    extraId: number,
    acceptClient: number,
    acceptClientDate: string,
  ) {
    const body = {
      id: extraId,
      accept_client: acceptClient,
      accept_client_date: acceptClientDate,
    };

    return this.http
      .put(`${API}/extra`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  saveApproval(id: number, approval: number, approvalDate: string) {
    const body = {
      id,
      approval,
      approval_date: approvalDate,
    };

    return this.http
      .put(`${API}/extra`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  saveObs(id: number, obs: string) {
    const body = {
      id,
      obs: obs,
    };

    return this.http
      .put(`${API}/extra`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  sendEmail(checkInId: number) {
    const body = {
      checkin_id: checkInId,
    };

    return this.http
      .post(
        `${API}/extra/email`,
        JSON.stringify(body),
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

  post(extra: ExtraModel): Observable<{
    message?: string,
    object?: ExtraModel
  }> {
    return this.http
      .post(
        `${API}/extra`,
        JSON.stringify(extra),
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

  put(extra: ExtraModel): Observable<{
    message?: string,
    object?: ExtraModel
  }> {
    return this.http
      .put(
        `${API}/extra`,
        JSON.stringify(extra),
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

  delete(extraId: number): Observable<any> {
    return this.http
      .delete(`${API}/extra/${extraId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
