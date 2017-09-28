import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MdSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Client } from './client.model';
import { AuthService } from '../login/auth.service';


@Injectable()
export class ClientService {
    constructor(
        private http: Http,
        private snackBar: MdSnackBar,
        private auth: AuthService
    ) {}

    clients(query: string = ''): Observable<Client[]> {
        let url = query === '' ? `clients/all` : `clients/filter/${query}`
        let prefix = this.auth.isClientMaster('clients/all') ? '' : 'my-'

        url = prefix + url

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    client(clientId: number): Observable<Client> {
        let url = `clients/get/${clientId}`
        let prefix = this.auth.isClientMaster('clients/get/{id}') ? '' : 'my-'

        url = prefix + url

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    save(client: Client): Observable<any> {
        let url = 'client/save'
        let prefix = this.auth.isClientMaster('client/save') ? '' : 'my-'

        url = prefix + url

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(client),
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
    
    edit(client: Client): Observable<any> {
        let url = 'client/edit'
        let prefix = this.auth.isClientMaster('client/edit') ? '' : 'my-'

        url = prefix + url

        return this.http.put(
                `${API}/${url}`,
                JSON.stringify(client),
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

    delete(id: number): Observable<any> {
        let url = `client/remove/${id}`
        let prefix = this.auth.isClientMaster('client/remove/{id}') ? '' : 'my-'

        url = prefix + url

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