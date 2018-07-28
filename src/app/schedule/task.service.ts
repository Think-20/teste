import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Task } from './task.model';
import { AuthService } from '../login/auth.service';
import { Pagination } from 'app/shared/pagination.model';
import { JobActivityServiceInterface } from 'app/jobs/job-activity-service.interface'
import { JobActivity } from '../job-activities/job-activity.model';


@Injectable()
export class TaskService {
  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) {}

  loadFormData(): Observable<any> {
    let url = `tasks/load-form`

    return this.http.get(`${API}/${url}`)
        .map(response => response.json())
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), '', {
                duration: 3000
            })
            return ErrorHandler.capture(err)
        })
  }

  /*
  recalculateNextDate(nextEstimatedTime): Observable<any> {
    let url = `tasks/recalculate-next-date/${nextEstimatedTime}`

    return this.http.get(`${API}/${url}`)
        .map(response => response.json())
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), '', {
                duration: 3000
            })
            return ErrorHandler.capture(err)
        })
  }
  */

  tasks(params?: {}, page: number = 0): Observable<Pagination> {
      let url = params === {} ? `tasks/all?page=${page}` : `tasks/filter?page=${page}`
      let prefix = (this.auth.hasAccess('tasks/all') ||  this.auth.hasAccess('tasks/filter')) ? '' : 'my-'

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

  task(taskId: number): Observable<Task> {
      let url = `tasks/get/${taskId}`
      let prefix = this.auth.hasAccess('tasks/get/{id}') ? '' : 'my-'

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

  getNextAvailableDate(availableDate: string, estimatedTime: number, jobActivity: JobActivity): Observable<any> {
      let url = `tasks/get-next-available-date/${availableDate}/${estimatedTime}/${jobActivity.description}`

      return this.http.get(`${API}/${url}`)
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }

  getAvailableDates(params = {}): Observable<any> {
      let url = `tasks/get-available-dates`

      return this.http.post(`${API}/${url}`,
          JSON.stringify(params),
          new RequestOptions())
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }

  save(task: Task): Observable<any> {
      let url = 'task/save'
      let prefix = this.auth.hasAccess('task/save') ? '' : 'my-'

      url = prefix + url

      return this.http.post(
              `${API}/${url}`,
              JSON.stringify(task),
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

  edit(task: Task): Observable<any> {
      let url = 'task/edit'
      let prefix = this.auth.hasAccess('task/edit') ? '' : 'my-'

      url = prefix + url

      return this.http.put(
              `${API}/${url}`,
              JSON.stringify(task),
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

  editAvailableDate(task1: Task, task2: Task): Observable<any> {
      let url = 'task/edit-available-date'
      let prefix = this.auth.hasAccess('task/edit-available-date') ? '' : 'my-'

      url = prefix + url

      return this.http.put(
              `${API}/${url}`,
              JSON.stringify({task1: task1, task2: task2}),
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
      let url = `task/remove/${id}`
      let prefix = this.auth.hasAccess('task/remove/{id}') ? '' : 'my-'

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
