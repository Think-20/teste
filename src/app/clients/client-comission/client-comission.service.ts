import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../../app.api';
import { ErrorHandler } from '../../shared/error-handler.service';
import { ClientComission } from './client-comission.model';
import { AuthService } from '../../login/auth.service';


@Injectable()
export class ClientComissionService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    comission(): Observable<ClientComission[]> {
        let url = `client-comission/all`

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
