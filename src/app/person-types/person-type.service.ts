import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { PersonType } from './person-type.model';


@Injectable()
export class PersonTypeService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    personTypes(query: string = ''): Observable<any> {
        let url = `person-types/all`

        return this.http.get(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    /*
    costCategory(costCategoryId: number): Observable<CostCategory> {
        return this.http.get(`${API}/cost-categories/get/${costCategoryId}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(costCategory: CostCategory): Observable<any> {
        return this.http.post(
                `${API}/cost-category/save`,
                JSON.stringify(costCategory),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
    
    edit(costCategory: CostCategory): Observable<any> {
        return this.http.put(
                `${API}/cost-category/edit`,
                JSON.stringify(costCategory),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    delete(id: number): Observable<CostCategory> {
        return this.http.delete(`${API}/cost-category/remove/${id}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
    */
}