import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';

import { User } from '../user/user.model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar
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

    queryAccess() {
      return `access_token=${this.token()}&user_id=${this.currentUser().id}`
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

    hasAccess(url: string): boolean {
        let urlWithBar = '/' + url

        let currentUser = this.currentUser()
        let isMaster: boolean = false

        this.currentUser().functionalities.map(funcionality => {
            return funcionality.url
        }).forEach(functionality => {
            if(functionality === urlWithBar) isMaster = true
        })

        return isMaster;
    }

    token() {
        return localStorage.getItem('token')
    }
}
