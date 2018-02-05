import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { BankAccountType } from './bank-account-type.model';


@Injectable()
export class BankAccountTypeService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar
    ) {}

    bankAccountTypes(query: string = ''): Observable<BankAccountType[]> {
        let url = `bank-account-types/all`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
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
            .map(response => response.json())
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
                new RequestOptions()
            )
            .map(response => response.json())
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
                new RequestOptions()
            )
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    delete(id: number): Observable<CostCategory> {
        return this.http.delete(`${API}/cost-category/remove/${id}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
    */
}