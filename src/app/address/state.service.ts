import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { API } from '../app.api';
import { State } from './state.model';

@Injectable()
export class StateService {
    constructor(
        private http: HttpClient
    ) {}

    states(stateName: string = 'all'): Observable<State[]> {
        return this.http.get<State[]>(`${API}/states/${stateName}`)
    }
}