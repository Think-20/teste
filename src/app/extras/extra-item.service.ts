import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs/Observable";
import { API } from "../app.api";
import { ErrorHandler } from "../shared/error-handler.service";
import { ExtraItemModel } from 'app/shared/models/extra-item.model';

@Injectable()
export class ExtraItemService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  post(extraItem: ExtraItemModel): Observable<{
    message?: string,
    object?: ExtraItemModel
  }> {
    return this.http
      .post(
        `${API}/extraItem`,
        JSON.stringify(extraItem),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  put(extraItem: ExtraItemModel): Observable<{
    message?: string,
    object?: ExtraItemModel
  }> {
    return this.http
      .put(
        `${API}/extraItem`,
        JSON.stringify(extraItem),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  delete(extraItemId: number): Observable<any> {
    return this.http
      .delete(`${API}/extraItem/${extraItemId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
