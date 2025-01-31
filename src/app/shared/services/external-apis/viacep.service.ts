import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { MatSnackBar } from "@angular/material";
import { ErrorHandler } from "../../error-handler.service";
import { Observable } from "rxjs";
import { ExternalApiService } from "./external-api.service";

@Injectable({
  providedIn: "root",
})
export class ViaCepService extends ExternalApiService {
  static api = "https://viacep.com.br";

  constructor(private http: Http, private snackBar: MatSnackBar) {
    super();
  }

  get(cep: string): Observable<any> {
    cep = cep.replace(/\D/g, "");

    return this.http
      .get(`${ViaCepService.api}/ws/${cep}/json/`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
