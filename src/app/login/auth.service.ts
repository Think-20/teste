import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MdSnackBar } from '@angular/material'

import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';

import { User } from '../user/user.model';
import { Observable } from 'rxjs/Observable';
 
@Injectable()
export class AuthService {
    constructor(
        private http: Http,
        private snackBar: MdSnackBar
    ) { }
    
    login(data): Observable<any> {
        let url = `${API}/login`

        return this.http
            .post(url, JSON.stringify(data))
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    logout() {        
        let url = `${API}/logout`

        if(this.currentUser()) {
            this.http
                .post(url, '')
                .catch((err) => {
                    this.snackBar.open(ErrorHandler.message(err), '', {
                        duration: 3000
                    })
                    return ErrorHandler.capture(err)
                })
                .subscribe(res => {
                    this.clear()
                })
        }
    }

    setData(data) {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
    }

    clear() {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('token')
    }

    currentUser(): User {
        let currentUser = localStorage.getItem('currentUser')
        return JSON.parse(currentUser)
    }
    
    isClientMaster(url: string): boolean {
        let urlWithBar = '/' + url

        let currentUser = this.currentUser()
        let isClientMaster: boolean = false

        this.currentUser().functionalities.map(funcionality => {
            return funcionality.url
        }).forEach(functionality => {
            if(functionality === urlWithBar) isClientMaster = true
        })

        return isClientMaster;
    }

    token() {
        return localStorage.getItem('token')
    }
}