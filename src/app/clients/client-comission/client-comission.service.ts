import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    comission(): Observable<ClientComission[]> {
        let url = `client-comission/all`

        return this.http.get<ClientComission[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
