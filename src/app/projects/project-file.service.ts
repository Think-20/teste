import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { ProjectFile } from './project-file.model';
import { AuthService } from '../login/auth.service';
import { Pagination } from 'app/shared/pagination.model';
import { Task } from '../schedule/task.model';


@Injectable()
export class ProjectFileService {
  data: ProjectFile = new ProjectFile

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  projectFiles(params?: {}, page: number = 0): Observable<Pagination> {
    let url = params === {} ? `projectFiles/all?page=${page}` : `projectFiles/filter?page=${page}`
    let prefix = this.auth.hasAccess('projectFiles/all') ? '' : 'my-'

    url = prefix + url

    return this.http.post(`${API}/${url}`,
      JSON.stringify(params),
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

  projectFile(projectFileId: number): Observable<ProjectFile> {
    let url = `projectFiles/get/${projectFileId}`
    let prefix = this.auth.hasAccess('projectFiles/get/{id}') ? '' : 'my-'

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

  save(projectFile: ProjectFile): Observable<any> {
    let url = 'project-file/save'
    let prefix = this.auth.hasAccess('project-file/save') ? '' : 'my-'

    url = prefix + url

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(projectFile),
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

  saveMultiple(projectFiles: ProjectFile[]): Observable<any> {
    let url = 'project-files/save-multiple'

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(projectFiles),
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

  edit(projectFile: ProjectFile): Observable<any> {
    let url = 'project-file/edit'
    let prefix = this.auth.hasAccess('project-file/edit') ? '' : 'my-'

    url = prefix + url

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(projectFile),
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
    let url = `project-file/remove/${id}`

    return this.http.delete(`${API}/${url}`)
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  download(projectFile: ProjectFile) {
    let url = `project-files/download/${projectFile.id}`

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

  previewFile(projectFile: ProjectFile) {
    let url = `project-files/download/${projectFile.id}?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`

    window.open(`${API}/${url}`, '_blank')
  }

  downloadAll(task: Task) {
    let url = `project-files/download-all/${task.id}?access_token=${this.auth.token()}&user_id=${this.auth.currentUser().id}`

    window.open(`${API}/${url}`, '_blank')
  }
}
