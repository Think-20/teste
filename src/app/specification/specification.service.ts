import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Specification } from './specification.model';
import { AuthService } from '../login/auth.service';
import { Pagination } from 'app/shared/pagination.model';
import { Task } from '../schedule/task.model';


@Injectable()
export class SpecificationService {
  data: Specification = new Specification

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  saveMultiple(specifications: Specification[]): Observable<any> {
    let url = 'specifications/save-multiple'

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(specifications),
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
    let url = `specifications/remove/${id}`

    return this.http.delete(`${API}/${url}`)
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  download(specification: Specification) {
    let url = this.downloadUrl(specification)

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

  downloadUrl(specification: Specification) {
    return `specifications/download/${specification.id}`
  }

  previewFile(specification: Specification) {
    let url = this.previewFileUrl(specification)

    window.open(`${API}/${url}`, '_blank')
  }

  previewFileUrl(specification: Specification) {
    return `specifications/download/${specification.id}?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`
  }

  downloadAll(task: Task) {
    let url = `specifications/download-all/${task.id}?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`

    window.open(`${API}/${url}`, '_blank')
  }
}
