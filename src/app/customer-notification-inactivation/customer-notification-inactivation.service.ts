import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  get(): Observable<InactiveTime[]> {
    const req = new HttpRequest('GET', `${API}/${this.url}`, { body: JSON.stringify({ id: 1 })}, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'json',
    });

    return this.http.request<InactiveTime[]>(req)
      .filter(event => event.type === HttpEventType.Response)
      .map((event: HttpResponse<InactiveTime[]>) => event.body)
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      });
  }

  update(goal: InactiveTime): Observable<InactiveTime> {
    return this.http.put<InactiveTime>(`${API}/${this.url}`,
      JSON.stringify(goal),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  post(goal: InactiveTime): Observable<InactiveTime> {
    return this.http.post<InactiveTime>(`${API}/${this.url}`,
      JSON.stringify(goal),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }
}