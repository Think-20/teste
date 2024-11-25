import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';
import 'rxjs/add/operator/catch';


import { API } from '../app.api';
import { Timecard } from './timecard.model';
import { ErrorHandler } from '../shared/error-handler.service';
import { AuthService } from '../login/auth.service';
import { Pagination } from '../shared/pagination.model';
import { Employee } from '../employees/employee.model';
import { IPlannerLog } from './models/planner-log.model';


@Injectable()
export class TimecardService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {}

    hasAccess(module: string): boolean {
      let access: boolean = false
      switch(module) {
        case 'delete': {
          access = this.authService.hasAccess('employees/office-hours/remove/{id}')
          break;
        }
        case 'edit': {
          access = this.authService.hasAccess('employees/office-hours/edit')
          break;
        }
        case 'list': {
          access = this.authService.hasAccess('employees/office-hours/show/another')
          break;
        }
        case 'new': {
          access = this.authService.hasAccess('employees/office-hours/register/another')
          break;
        }
        case 'approve': {
          access = this.authService.hasAccess('employees/office-hours/approvals-pending/approve/{id}')
          break;
        }
        default: {
          break;
        }
      }
      return access
    }

    timecards(params?: {}): Observable<any> {
        let url = this.authService.hasAccess('employees/office-hours/show/another')
          ? `employees/office-hours/show/another` : 'employees/office-hours/show/yourself'

        return this.http.post(`${API}/${url}`,
              JSON.stringify(params)
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    status(): Observable<Timecard[]> {
        return this.http.get<Timecard[]>(`${API}/employees/office-hours/status/yourself`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    approvalsPending(): Observable<Timecard[]> {
        let url = `employees/office-hours/approvals-pending/show`

        return this.http.get<Timecard[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    approve(id: number): Observable<any> {
        let url = `employees/office-hours/approvals-pending/approve/${id}`

        return this.http.get(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    timecard(timecardId: number): Observable<Timecard> {
        return this.http.get<Timecard>(`${API}/employees/office-hours/get/${timecardId}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    register(data): Observable<any> {
      let url = 'employees/office-hours/register/yourself'

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(data),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(timecard: Timecard): Observable<any> {
      /*
      let url = this.authService.hasAccess('employees/office-hours/register/another')
        ? `employees/office-hours/register/another` : 'employees/office-hours/register/yourself'
      */
      let url = `employees/office-hours/register/another`

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(timecard),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    edit(timecard: Timecard): Observable<any> {
        return this.http.put(
                `${API}/employees/office-hours/edit`,
                JSON.stringify(timecard),
                
            )
            
    }

    delete(id: number): Observable<any> {
        return this.http.delete(`${API}/employees/office-hours/remove/${id}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    getLogs(year: number, month: number, employeeId: number): Observable<IPlannerLog[]> {
        return this.http.get<IPlannerLog[]>(`${API}/planner/${year}/${month}/${employeeId}`)
            ;
    }

    postLog(log: IPlannerLog): Observable<{ object: IPlannerLog }> {
        return this.http.post<{ object: IPlannerLog }>(`${API}/planner`, log)
            ;
    }

    putLog(log: IPlannerLog): Observable<{ object: IPlannerLog }> {
        return this.http.put<{ object: IPlannerLog }>(`${API}/planner`, log)
            ;
    }
}
