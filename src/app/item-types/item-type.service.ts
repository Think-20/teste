import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';
import 'rxjs/add/operator/catch';


import { API } from '../app.api';
import { ItemType } from './item-type.model';
import { ErrorHandler } from '../shared/error-handler.service';


@Injectable()
export class ItemTypeService {
    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar
    ) {}

    itemCategories(query: string = ''): Observable<ItemType[]> {
        let url = query === '' ? `item-types/all` : `item-types/filter/${query}`

        return this.http.get(`${API}/${url}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    itemType(itemTypeId: number): Observable<ItemType> {
        return this.http.get(`${API}/item-types/get/${itemTypeId}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(itemType: ItemType): Observable<any> {
        return this.http.post(
                `${API}/item-type/save`,
                JSON.stringify(itemType),
                
            )
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
    
    edit(itemType: ItemType): Observable<any> {
        return this.http.put(
                `${API}/item-type/edit`,
                JSON.stringify(itemType),
                
            )
            
    }

    delete(id: number): Observable<ItemType> {
        return this.http.delete(`${API}/item-type/remove/${id}`)
            
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}