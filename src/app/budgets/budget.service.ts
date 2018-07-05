import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Budget } from './budget.model';
import { AuthService } from '../login/auth.service';
import { Pagination } from 'app/shared/pagination.model';
import { JobActivityServiceInterface } from 'app/jobs/job-activity-service.interface'


@Injectable()
export class BudgetService implements JobActivityServiceInterface {
  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  loadFormData(): Observable<any> {
    let url = `budgets/load-form`

    return this.http.get(`${API}/${url}`)
        .map(response => response.json())
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), '', {
                duration: 3000
            })
            return ErrorHandler.capture(err)
        })
  }

  recalculateNextDate(nextEstimatedTime): Observable<any> {
    let url = `budgets/recalculate-next-date/${nextEstimatedTime}`

    return this.http.get(`${API}/${url}`)
        .map(response => response.json())
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), '', {
                duration: 3000
            })
            return ErrorHandler.capture(err)
        })
  }

  budgets(params?: {}, page: number = 0): Observable<Pagination> {
      let url = params === {} ? `budgets/all?page=${page}` : `budgets/filter?page=${page}`
      let prefix = this.auth.hasAccess('budgets/all') ? '' : 'my-'

      url = prefix + url

      return this.http.post(`${API}/${url}`,
            JSON.stringify(params),
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

  budget(budgetId: number): Observable<Budget> {
      let url = `budgets/get/${budgetId}`
      let prefix = this.auth.hasAccess('budgets/get/{id}') ? '' : 'my-'

      url = prefix + url

      return this.http.get(`${API}/${url}`)
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }

  getNextAvailableDate(date: string): Observable<any> {
      let url = `budget/get-next-available/${date}`

      return this.http.get(`${API}/${url}`)
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }

  save(budget: Budget): Observable<any> {
      let url = 'budget/save'
      let prefix = this.auth.hasAccess('budget/save') ? '' : 'my-'

      url = prefix + url

      return this.http.post(
              `${API}/${url}`,
              JSON.stringify(budget),
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

  edit(budget: Budget): Observable<any> {
      let url = 'budget/edit'
      let prefix = this.auth.hasAccess('budget/edit') ? '' : 'my-'

      url = prefix + url

      return this.http.put(
              `${API}/${url}`,
              JSON.stringify(budget),
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

  editAvailableDate(budget: Budget): Observable<any> {
      let url = 'budget/edit-available-date'
      let prefix = this.auth.hasAccess('budget/edit-available-date') ? '' : 'my-'

      url = prefix + url

      return this.http.put(
              `${API}/${url}`,
              JSON.stringify(budget),
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

  delete(id: number): Observable<any> {
      let url = `budget/remove/${id}`
      let prefix = this.auth.hasAccess('budget/remove/{id}') ? '' : 'my-'

      url = prefix + url

      return this.http.delete(`${API}/${url}`)
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }
}
