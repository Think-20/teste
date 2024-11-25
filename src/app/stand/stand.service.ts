import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Stand } from './stand.model';


@Injectable()
export class StandService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}
}
