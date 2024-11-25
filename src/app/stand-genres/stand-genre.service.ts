import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { StandGenre } from './stand-genre.model';


@Injectable()
export class StandGenreService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    standGenres(query: string = ''): Observable<StandGenre[]> {
        let url = query === '' ? `stand-genres/all` : `stand-genres/filter/${query}`

        return this.http.get<StandGenre[]>(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}
