import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Measure } from './measure.model';
import { AuthService } from '../login/auth.service';


@Injectable()
export class MeasureService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    measures(query: string = ''): Observable<any> {
        let url = query === '' ? `measures/all` : `measures/filter/${query}`

        return this.http.get(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    /*
    save(measure: Measure): Observable<Measure> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json')

        return this.http.post(
                `${API}/measures`,
                JSON.stringify(measure),
                new RequestOptions({headers: headers})
            )
            
    }

    delete(id: number): Observable<Measure> {
        return this.http.delete(`${API}/measures/${id}`)
            
    }
    */
}