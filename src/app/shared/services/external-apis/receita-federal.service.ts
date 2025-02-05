import { Http } from "@angular/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { MatSnackBar } from "@angular/material";
import { ErrorHandler } from "app/shared/error-handler.service";
import { environment } from 'environments/environment';

@Injectable({
  providedIn: "root",
})
export class ReceitaFederalService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  get(cnpj: string): Observable<any> {
    cnpj = cnpj.replace(/[./-]/g, "");

    return this.http
      .get(`${environment.api}/cnpjDatas/${cnpj}`)
      .map((response) => response.json());
  }
}
