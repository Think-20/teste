import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { Item } from './item.model';
import { Pricing } from '../pricings/pricing.model';
import { ChildItem } from '../child-items/child-item.model';
import { AuthService } from '../login/auth.service';
import { DataInfo } from 'app/shared/data-info.model';


@Injectable()
export class ItemService {
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  searchValue = {}
  pageIndex = 0

  items(params?: {}, page: number = 0): Observable<any> {
    let url = params === {} ? `items/all?page=${page}` : `items/filter?page=${page}`

    return this.http.post(`${API}/${url}`,
      JSON.stringify(params),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  uploadImage(file: any): Observable<any> {
    let requestOptions = {
      headers: new HttpHeaders()
    };

    let headers = new HttpHeaders()

    let user = this.auth.currentUser()
    let token = this.auth.token()

    headers.set('Authorization', `${token}`)
    headers.set('User', `${user.id}`)
    requestOptions.headers = headers

    let url = 'item/image'
    let data = new FormData()
    data.append('image', file, file.name)

    return this.http.post(`${API}/${url}`, data, requestOptions)
      
  }

  item(itemId: number): Observable<any> {
    let url = `items/get/${itemId}`

    return this.http.get(`${API}/${url}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  savePricing(item: Item, pricing: Pricing): Observable<any> {
    let url = `item/save-pricing/${item.id}`

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(pricing),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  removePricing(item: Item, pricing: Pricing): Observable<any> {
    let url = `item/${item.id}/remove-pricing/${pricing.id}`

    return this.http.delete(
      `${API}/${url}`,
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  saveChildItem(item: Item, childItem: ChildItem): Observable<any> {
    let url = `item/save-child-item/${item.id}`

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(childItem),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  removeChildItem(item: Item, childItem: ChildItem): Observable<any> {
    let url = `item/${item.id}/remove-child-item/${childItem.id}`

    return this.http.delete(
      `${API}/${url}`,
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  save(item: Item): Observable<any> {
    let url = 'item/save'

    return this.http.post(
      `${API}/${url}`,
      JSON.stringify(item),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  edit(item: Item): Observable<any> {
    let url = 'item/edit'

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(item),
      
    )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  delete(id: number): Observable<any> {
    let url = `item/remove/${id}`

    return this.http.delete(`${API}/${url}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }
}
