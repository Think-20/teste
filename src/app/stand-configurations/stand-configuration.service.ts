import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { StandConfiguration } from './stand-configuration.model';


@Injectable()
export class StandConfigurationService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    standConfigurations(query: string = ''): Observable<StandConfiguration[]> {
        let url = query === '' ? `stand-configurations/all` : `stand-configurations/filter/${query}`

        return this.http.get<StandConfiguration[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
