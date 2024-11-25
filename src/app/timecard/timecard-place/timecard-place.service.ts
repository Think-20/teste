import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';
import 'rxjs/add/operator/catch';

import { API } from '../../app.api';
import { ErrorHandler } from '../../shared/error-handler.service';
import { AuthService } from '../../login/auth.service';
import { TimecardPlace } from './timecard-place.model';

@Injectable()
export class TimecardPlaceService {
    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private snackBar: MatSnackBar
    ) {}

    places(params?: {}): Observable<TimecardPlace[]> {
        let url = `timecard/places/all`

        return this.http.get<TimecardPlace[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
