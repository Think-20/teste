import { Headers, Http } from "@angular/http";
import { Injectable } from "@angular/core";
import { ExternalApiService } from "./external-api.service";
import { Observable } from "rxjs";
import { MatSnackBar } from "@angular/material";
import { ErrorHandler } from "app/shared/error-handler.service";

@Injectable({
  providedIn: "root",
})
export class ReceitaFederalService extends ExternalApiService {
  static api = "https://receitaws.com.br";

  constructor(private http: Http, private snackBar: MatSnackBar) {
    super();
  }

  get(cnpj: string): Observable<any> {
    cnpj = cnpj.replace(/[./-]/g, "");

    return this.http
      .get(`/api-receitaws/v1/cnpj/${cnpj}`)
      .map((response) => response.json())
      .catch((err) => {
        if (err.status === 429) {
          this.snackBar.open("Não foi possível obter os dados", "", {
            duration: 3000,
          });
        } else {
          this.snackBar.open(ErrorHandler.message(err), "", {
            duration: 3000,
          });
        }

        return ErrorHandler.capture(err);
      });
  }
}
