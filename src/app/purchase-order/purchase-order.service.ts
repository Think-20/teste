import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';


import { API } from '../app.api';
import { PurchaseOrder } from './purchase-order.model';


@Injectable()
export class PurchaseOrderService {
    constructor(
        private http: HttpClient
    ) {}

    purchaseOrders(query:string = ''): Observable<PurchaseOrder[]> {
        return this.http.get<PurchaseOrder[]>(`${API}/purchase-orders${query}`)
            
    }

    
    save(purchaseOrder: PurchaseOrder): Observable<PurchaseOrder> {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json')

        return this.http.post<PurchaseOrder>(
                `${API}/purchase-orders`,
                JSON.stringify(purchaseOrder),
                {headers: headers}
            )
            
    }

    delete(id: number): Observable<PurchaseOrder> {
        return this.http.delete<PurchaseOrder>(`${API}/purchase-orders/${id}`)
            
    }
    
}