import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MdSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Item } from './item.model';
import { AuthService } from '../login/auth.service';


@Injectable()
export class ItemService {
    constructor(
        private http: Http,
        private snackBar: MdSnackBar,
        private auth: AuthService
    ) {}

    items(query: string = ''): Observable<Item[]> {
        let url = query === '' ? `items/all` : `items/filter/${query}`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    item(itemId: number): Observable<Item> {
        let url = `items/get/${itemId}`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    uploadImage(file: any): Observable<any> {
        let requestOptions = new RequestOptions()

        let url = 'item/image'
        let data = new FormData()
        data.append('file', file)

        return this.http.post(`${API}/${url}`, data, requestOptions)
    }

    save(item: Item): Observable<any> {
        let url = 'item/save'

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(item),
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
    
    edit(item: Item): Observable<any> {
        let url = 'item/edit'

        return this.http.put(
                `${API}/${url}`,
                JSON.stringify(item),
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

    delete(id: number): Observable<Item> {
        let url = `item/remove/${id}`

        return this.http.delete(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}