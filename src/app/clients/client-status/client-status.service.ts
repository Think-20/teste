import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MdSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../../app.api';
import { ErrorHandler } from '../../shared/error-handler.service';
import { ClientStatus } from './client-status.model';
import { AuthService } from '../../login/auth.service';


@Injectable()
export class ClientStatusService {
    constructor(
        private http: Http,
        private snackBar: MdSnackBar,
        private auth: AuthService
    ) {}

    status(): Observable<ClientStatus[]> {
        let url = `client-status/all`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}