import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ErrorHandler } from "../../shared/error-handler.service";
import { Observable } from 'rxjs';
import { API } from 'app/app.api';

@Injectable({
  providedIn: 'root'
})
export class ExternalCheckInService {

  constructor(private http: Http, private snackBar: MatSnackBar) {}

  accept(id: number, hash: string): Observable<{
    error: string,
    message: string,
  }> {
    const body = {
      checkin_id: id,
      checkin_hash: hash,
      accept_client: 1,
    };

    return this.http
      .post(`${API}/checking/confirm`, body)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  refuse(id: number, hash: string, reasonForRejection: string): Observable<{
    error: string,
    message: string,
  }> {
    const body = {
      checkin_id: id,
      checkin_hash: hash,
      accept_client: 2,
      reason_for_rejection: reasonForRejection
    };

    return this.http
      .post(`${API}/checking/confirm`, body)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
