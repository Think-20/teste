import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from 'app/app.api';
import { AuthService } from 'app/login/auth.service';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Observable, of } from 'rxjs';
import { Goal } from './goals.model';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable()
export class GoalsService {
  searchValue: any = {}
  pageIndex = 0
  layoutGrid: string;
  layoutGrid2: string;
  private url = 'goal';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  getGoals(): Observable<any> {
    const req = new HttpRequest('GET', `${API}/${this.url}`, { body: JSON.stringify({ id: 1 })}, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'json',
    });

    return this.http.request(req)
      .filter(event => event.type === HttpEventType.Response)
      .map((event: HttpResponse<any>) => event.body)
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      });
  }


  updateGoals(goal: Goal): Observable<any> {
    return this.http.put(`${API}/${this.url}`,
      JSON.stringify(goal),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  postGoals(goal: Goal): Observable<any> {
    return this.http.post(`${API}/${this.url}`,
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