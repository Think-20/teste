import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';

import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { AuthService } from '../login/auth.service';

@Injectable()
export class UploadFileService {
  constructor(
      private http: Http,
      private snackBar: MatSnackBar,
      private auth: AuthService
  ) {}

  /*
  uploadFile(form: FormGroup, key: string, inputFile: HTMLInputElement) {
    if(key.indexOf('.') > 0) {
      let keys = key.split('.')
      keys.forEach((value, index) => {
        if(index < keys.length) {
          form = <FormGroup> form.get(value)
        } else {
          key = value
        }
      })
    }

    form.get(key).setValue('Aguarde...')
    let files = inputFile.files
    let filename = ''

    for(var i = 0; i < files.length; i++) {
      filename += files.item(i).name.replace(/^C:\\fakepath\\/i, '') + ','
    }
    filename = filename.slice(0, filename.length - 1)

    this.sendToServer(form.get(key), files).subscribe((data) => {
      form.get(key).setValue(filename)
    })
  }
  */

  uploadFile(inputFile: HTMLInputElement) {
    let files = inputFile.files
    let filenames = []

    return this.sendToServer(files)
  }

  private sendToServer(files: FileList): Observable<any> {
      let requestOptions = new RequestOptions()
      let headers = new Headers()

      let user = this.auth.currentUser()
      let token = this.auth.token()

      headers.set('Authorization', `${token}`)
      headers.set('User', `${user.id}`)
      requestOptions.headers = headers

      let url = 'upload-file'
      let data = new FormData()
      
      for(var i = 0; i < files.length; i++)
      data.append(i.toString(), files.item(i), files.item(i).name)

      return this.http.post(`${API}/${url}`, data, requestOptions)
          .map(response => response.json())
          .catch((err) => {
              this.snackBar.open(ErrorHandler.message(err), '', {
                  duration: 3000
              })
              return ErrorHandler.capture(err)
          })
  }
}
