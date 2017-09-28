import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


import { API } from '../app.api';
import { Measure } from './measure.model';


@Injectable()
export class MeasureService {
    constructor(
        private http: Http
    ) {}

    measures(): Observable<Measure[]> {
        return this.http.get(`${API}/measures`)
            .map(response => response.json())
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
            .map(response => response.json())
    }

    delete(id: number): Observable<Measure> {
        return this.http.delete(`${API}/measures/${id}`)
            .map(response => response.json())
    }
    */
}