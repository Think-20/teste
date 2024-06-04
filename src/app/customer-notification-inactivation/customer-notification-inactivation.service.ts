import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable } from 'rxjs';
import { InactiveTime } from './customer-notification-inactivation.model';

@Injectable()
export class CustomeNotificationInactivationService {
  searchValue: any = {}
  pageIndex = 0
  layoutGrid: string;
  layoutGrid2: string;
  private url = 'inactiveTime';

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  get(): Observable<InactiveTime[]> {
    return this.http.get(`${API}/${this.url}`, { body: JSON.stringify({ id: 1 })})
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  update(goal: InactiveTime): Observable<InactiveTime> {
    return this.http.put(`${API}/${this.url}`,
      JSON.stringify(goal),
      new RequestOptions()
    )
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  post(goal: InactiveTime): Observable<InactiveTime> {
    return this.http.post(`${API}/${this.url}`,
      JSON.stringify(goal),
      new RequestOptions()
    )
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }
}