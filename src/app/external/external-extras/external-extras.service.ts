import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { ErrorHandler } from "../../shared/error-handler.service";
import { ExtraModel } from 'app/shared/models/extra.model';
import { Observable } from 'rxjs';
import { API } from 'app/app.api';

@Injectable({
  providedIn: 'root'
})
export class ExternalExtrasService {

  constructor(private http: Http, private snackBar: MatSnackBar) {}

  get(id: number, hash: string): Observable<ExtraModel[]> {
    return this.http
      .get(`${API}/extra/${id}/${hash}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  confirm(id: number, hash: string): Observable<string> {
    return this.http
      .post(`${API}/extra/${id}/${hash}`, { checkin_id: id, hash })
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
