import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../app.api";
import { ErrorHandler } from "../shared/error-handler.service";
import { ExtraModel } from '../shared/models/extra.model';

@Injectable()
export class ExtrasService {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  extras(): Observable<ExtraModel[]> {
    return this.http
      .get<ExtraModel[]>(`${API}/extra`)
      
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
      extras_obs: obs,
    };

    return this.http
      .put(`${API}/checking`, JSON.stringify(body), )
      
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
        
      )
      
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
        
      )
      
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
        
      )
      
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
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
