import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Event } from './event.model';
import { AuthService } from '../login/auth.service';
import { Pagination } from '../shared/pagination.model';
import { DataInfo } from '../shared/data-info.model';


@Injectable()
export class EventService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    events(params?: {}, page: number = 0): Observable<DataInfo> {
      let url = params === {} ? `events/all?page=${page}` : `events/filter?page=${page}`
      let prefix = this.auth.hasAccess('events/all') ? '' : 'my-'

        url = prefix + url

        return this.http.post(
              `${API}/${url}`,
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

    event(eventId: number): Observable<Event> {
        let url = `events/get/${eventId}`
        let prefix = this.auth.hasAccess('events/get/{id}') ? '' : 'my-'

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

    uploadSheet(file: any): Observable<any> {
        let requestOptions = new RequestOptions()
        let headers = new Headers()

        let user = this.auth.currentUser()
        let token = this.auth.token()

        headers.set('Authorization', `${token}`)
        headers.set('User', `${user.id}`)
        requestOptions.headers = headers

        let url = 'event/import'
        let data = new FormData()
        data.append('file', file, file.name)

        return this.http.post(`${API}/${url}`, data, requestOptions)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(event: Event): Observable<any> {
        let url = 'event/save'
        let prefix = this.auth.hasAccess('event/save') ? '' : 'my-'

        url = prefix + url

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(event),
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

    edit(event: Event): Observable<any> {
        let url = 'event/edit'
        let prefix = this.auth.hasAccess('event/edit') ? '' : 'my-'

        url = prefix + url

        return this.http.put(
                `${API}/${url}`,
                JSON.stringify(event),
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
        let url = `event/remove/${id}`
        let prefix = this.auth.hasAccess('event/remove/{id}') ? '' : 'my-'

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
