import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { BriefingCompetition } from './briefing-competition.model';


@Injectable()
export class BriefingCompetitionService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar
    ) {}

    briefingCompetitions(query: string = ''): Observable<BriefingCompetition[]> {
        let url = query === '' ? `briefing-competitions/all` : `briefing-competitions/filter/${query}`

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
