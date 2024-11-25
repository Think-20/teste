import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    status(): Observable<ClientStatus[]> {
        let url = `client-status/all`

        return this.http.get<ClientStatus[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}