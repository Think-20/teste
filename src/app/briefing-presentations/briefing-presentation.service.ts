import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { BriefingPresentation } from './briefing-presentation.model';


@Injectable()
export class BriefingPresentationService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    briefingPresentations(query: string = ''): Observable<BriefingPresentation[]> {
        let url = query === '' ? `briefing-presentations/all` : `briefing-presentations/filter/${query}`

        return this.http.get<BriefingPresentation[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
