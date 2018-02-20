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
import { Pagination } from 'app/shared/pagination.model';


@Injectable()
export class BriefingService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar,
        private auth: AuthService
    ) {}

    showId(briefing: Briefing): string {
      let size = 4
      let date = new Date(briefing.created_at)
      return (String('0').repeat(size) + briefing.code).substr( (size * -1), size) + '/' + date.getFullYear()
    }

    loadFormData(): Observable<any> {
      let url = `briefings/load-form`

      return this.http.get(`${API}/${url}`)
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
    }

    briefings(query: string = '', page: number = 0): Observable<Pagination> {
        let url = query === '' ? `briefings/all?page=${page}` : `briefings/filter/${query}?page=${page}`
        let prefix = this.auth.hasAccess('briefings/all') ? '' : 'my-'

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

    briefing(briefingId: number): Observable<Briefing> {
        let url = `briefings/get/${briefingId}`
        let prefix = this.auth.hasAccess('briefings/get/{id}') ? '' : 'my-'

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

    download(briefing: Briefing, type: String, file: String) {
      let url = `briefing/download/${briefing.id}/${type}/${file}`
      let prefix = this.auth.hasAccess('briefing/download/{id}/{type}/{file}') ? '' : 'my-'

      url = prefix + url

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
      let url = `briefing/download/${briefing.id}/${type}/${file}?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`
      let prefix = this.auth.hasAccess('briefing/download/{id}/{type}/{file}') ? '' : 'my-'

      url = prefix + url

      window.open(`${API}/${url}`, '_blank')
    }

    save(briefing: Briefing): Observable<any> {
        let url = 'briefing/save'
        let prefix = this.auth.hasAccess('briefing/save') ? '' : 'my-'

        url = prefix + url

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
        let prefix = this.auth.hasAccess('briefing/edit') ? '' : 'my-'

        url = prefix + url

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
        let prefix = this.auth.hasAccess('briefing/remove/{id}') ? '' : 'my-'

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
