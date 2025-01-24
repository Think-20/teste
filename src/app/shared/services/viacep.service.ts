import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { ErrorHandler } from '../error-handler.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  get(cep: string): Observable<any> {
    cep = cep.replace(/\D/g, '');

    return this.http
      .get(`https://viacep.com.br/ws/${cep}/json/`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
