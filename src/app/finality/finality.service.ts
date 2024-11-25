import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


import { API } from '../app.api';
import { Finality } from './finality.model';


@Injectable()
export class FinalityService {
    constructor(
        private http: HttpClient
    ) {}

    finalities(): Observable<any> {
        return this.http.get(`${API}/finalities`)
            
    }

    /*
    save(finality: finality): Observable<Finality> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json')

        return this.http.post(
                `${API}/finalities`,
                JSON.stringify(finality),
                new RequestOptions({headers: headers})
            )
            
    }

    delete(id: number): Observable<Finality> {
        return this.http.delete(`${API}/finalities/${id}`)
            
    }
    */
}