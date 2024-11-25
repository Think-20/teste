import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Position } from './position.model';
import { AuthService } from '../login/auth.service';
import { DataInfo } from '../shared/data-info.model';


@Injectable()
export class PositionService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}


    positions(params?: {}, page: number = 0): Observable<any> {
      let url = params === {} ? `positions/all?page=${page}` : `positions/filter?page=${page}`
      //let prefix = this.auth.hasAccess('positions/all') ? '' : 'my-'
      let prefix = ''

        url = prefix + url

        return this.http.post(
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

    position(positionId): Observable<any> {
        let url = `positions/get/${positionId}`
        let prefix = this.auth.hasAccess('positions/get/{id}') ? '' : 'my-'

        url = prefix + url

        return this.http.get(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    canInsertClients(): Observable<Position[]> {
        let url = `positions/can-insert-clients`

        return this.http.get<Position[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(position: Position): Observable<any> {
        let url = 'position/save'
        let prefix = this.auth.hasAccess('position/save') ? '' : 'my-'

        url = prefix + url

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(position),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    edit(position: Position): Observable<any> {
        let url = 'position/edit'
        let prefix = this.auth.hasAccess('position/edit') ? '' : 'my-'

        url = prefix + url

        return this.http.put(
                `${API}/${url}`,
                JSON.stringify(position),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    delete(id: number): Observable<any> {
        let url = `position/remove/${id}`
        let prefix = this.auth.hasAccess('position/remove/{id}') ? '' : 'my-'

        url = prefix + url

        return this.http.delete(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
