import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Provider } from './provider.model';
import { AuthService } from '../login/auth.service';
import { DataInfo } from '../shared/data-info.model';


@Injectable()
export class ProviderService {
  searchValue = {}
  pageIndex = 0

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  providers(params = {}, page: number = 0): Observable<DataInfo> {
    let url = params == {} ? `providers/all?page=${page}` : `providers/filter?page=${page}`

    return this.http.post<DataInfo>(`${API}/${url}`,
        JSON.stringify(params),
        
      )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  provider(providerId: number): Observable<Provider> {
    let url = `providers/get/${providerId}`

    return this.http.get<Provider>(`${API}/${url}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  save(provider: Provider): Observable<any> {
    let url = 'provider/save'

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(provider),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  edit(provider: Provider): Observable<any> {
    let url = 'provider/edit'

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(provider),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  delete(id: number): Observable<any> {
    let url = `provider/remove/${id}`

    return this.http.delete(`${API}/${url}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }
}
