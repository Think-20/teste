import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { JobMainExpectation } from './job-main-expectation.model';


@Injectable()
export class JobMainExpectationService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    mainExpectations(query: string = ''): Observable<any> {
        let url = query === '' ? `job-main-expectations/all` : `job-main-expectations/filter/${query}`

        return this.http.get(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
