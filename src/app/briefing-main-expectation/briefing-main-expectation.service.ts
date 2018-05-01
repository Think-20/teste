import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { BriefingMainExpectation } from './briefing-main-expectation.model';


@Injectable()
export class BriefingMainExpectationService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar
    ) {}

    mainExpectations(query: string = ''): Observable<BriefingMainExpectation[]> {
        let url = query === '' ? `briefing-main-expectations/all` : `briefing-main-expectations/filter/${query}`

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
