import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../../app.api';
import { ErrorHandler } from '../../shared/error-handler.service';
import { AuthService } from '../../login/auth.service';
import { FileUploadInterface } from 'app/shared/file-upload/file-upload.interface';
import { HttpClient } from '@angular/common/http';


@Injectable()
export class FileUploadService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  delete(id: number): Observable<any> {
    let url = `project-files/remove/${id}`

    return this.http.delete(`${API}/${url}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  saveMultiple(filesInterface: FileUploadInterface[], url: string): Observable<any> {
    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(filesInterface),
      
    )
    
    .catch((err) => {
      this.snackBar.open(ErrorHandler.message(err), '', {
        duration: 3000
      })
      return ErrorHandler.capture(err)
    })
  }

  download(url: string) {
    return this.http.get(`${API}/${url}`, { responseType: 'arraybuffer' }).map(
    (res) => {
      return new Blob([res])
    })
    .catch((err) => {
      this.snackBar.open(ErrorHandler.message(err), '', {
        duration: 3000
      })
      return ErrorHandler.capture(err)
    })
  }
}
