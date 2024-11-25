import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { API } from '../app.api';
import { City } from './city.model';

@Injectable()
export class CityService {
    constructor(
        private http: HttpClient
    ) {}

    cities(stateId: number, cityName: string): Observable<City[]> {
        return this.http
            .get<City[]>(`${API}/cities/${stateId}/${cityName}`)
            
    }

    citiesById(cityId: number): Observable<City> {
        return this.http
            .get<City>(`${API}/city/${cityId}`)
            
    }
}