import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Budget } from './budget.model';
import { AuthService } from '../login/auth.service';
import { Pagination } from 'app/shared/pagination.model';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class BudgetService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  save(budget: Budget): Observable<any> {
      let url = 'budget/save'

      return this.http.post(
              `${API}/${url}`,
              JSON.stringify(budget),
          )
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }

  edit(budget: Budget): Observable<any> {
      let url = 'budget/edit'

      return this.http.put(
              `${API}/${url}`,
              JSON.stringify(budget),
              
          )
          
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }

  delete(id: number): Observable<any> {
      let url = `budget/remove/${id}`

      return this.http.delete(`${API}/${url}`)
          
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }
}
