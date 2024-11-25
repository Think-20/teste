import { Injectable } from '@angular/core'; 
import { HttpHeaders, HttpParamsOptions } from '@angular/common/http';
@Injectable()
export class RequestOptionsApiService {
    headers = new HttpHeaders

    constructor() {
        this.headers.set('Content-Type', 'application/json')
    }

    merge(options?) {
        const newOptions = { ...options };

        let user = JSON.parse(localStorage.getItem('currentUser')) || ''
        let token = localStorage.getItem('token') || ''

        newOptions.headers.set('Authorization', `${token}`)
        newOptions.headers.set('User', `${user.id}`)

        return newOptions
    }

}