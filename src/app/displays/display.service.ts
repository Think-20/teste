import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Display } from './display.model';
import { AuthService } from '../login/auth.service';
import { DataInfo } from '../shared/data-info.model';


@Injectable()
export class DisplayService {
  searchValue = {}
  pageIndex = 0

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}


    displays(params?: {}, page: number = 0): Observable<DataInfo> {
      let url = params === {} ? `displays/all?page=${page}` : `displays/filter?page=${page}`

        return this.http.post<DataInfo>(
              `${API}/${url}`,
              JSON.stringify(params),
              
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    display(displayId): Observable<Display> {
        let url = `displays/get/${displayId}`

        return this.http.get<Display>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(display: Display): Observable<any> {
        let url = 'display/save'

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(display),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    edit(display: Display): Observable<any> {
        let url = 'display/edit'

        return this.http.put(
                `${API}/${url}`,
                JSON.stringify(display),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    delete(id: number): Observable<any> {
        let url = `display/remove/${id}`

        return this.http.delete(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
