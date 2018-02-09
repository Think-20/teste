import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Briefing } from './briefing.model';
import { AuthService } from '../login/auth.service';


@Injectable()
export class BriefingService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    briefings(query: string = ''): Observable<Briefing[]> {
        let url = query === '' ? `briefings/all` : `briefings/filter/${query}`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    briefing(briefingId: number): Observable<Briefing> {
        let url = `briefings/get/${briefingId}`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }

    download(briefing: Briefing, type: String, file: String) {
      let url = `briefing/download/${briefing.id}/${type}/${file}`

      return this.http.get(`${API}/${url}`, { responseType: ResponseContentType.Blob }).map(
        (res) => {
            return new Blob([res.blob()], { type: res.headers.get('content-type') })
        })
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), '', {
                duration: 3000
            })
            return ErrorHandler.capture(err)
        })
    }

    previewFile(briefing: Briefing, type: string,  file: string) {
      let url = `${API}/briefing/download/${briefing.id}/${type}/${file}?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`
      window.open(url, '_blank')
    }

    save(briefing: Briefing): Observable<any> {
        let url = 'briefing/save'

        return this.http.post(
                `${API}/${url}`,
                JSON.stringify(briefing),
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

    edit(briefing: Briefing): Observable<any> {
        let url = 'briefing/edit'

        return this.http.put(
                `${API}/${url}`,
                JSON.stringify(briefing),
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
        let url = `briefing/remove/${id}`

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
