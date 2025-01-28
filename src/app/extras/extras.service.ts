import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../app.api";
import { ErrorHandler } from "../shared/error-handler.service";
import { ExtraItemModel } from '../shared/models/extra-item.model';
import { ExtraModel } from 'app/shared/models/extra.model';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExtrasService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  extras(): Observable<ExtraModel[]> {
    // return this.http
    //   .get(`${API}/extra`)
    //   .map((response) => response.json())
    //   .catch((err) => {
    //     this.snackBar.open(ErrorHandler.message(err), "", {
    //       duration: 3000,
    //     });

    //     return ErrorHandler.capture(err);
    //   });

    return of([
      {
        id: 1,
        description: 'Versão extras 1',
        job_id: 1,
        accept_client: 2,
        accept_client_date: '2024-01-21 23:35',
        approval: 1,
        approval_date: '2024-01-21 22:00',
        updated_by: 1,
        updated_at: '2024-01-21 22:00',
        extra_items: [
          {
            id: 1,
            extra_id: 1,
            description: 'Mesa',
            value: 150,
            quantity: 5,
            requester: 1,
            budget: 1,
          }
        ],
      },
      {
        id: 2,
        description: 'Versão extras 2',
        job_id: 1,
        accept_client: 0,
        approval: 0,
        extra_items: [],
      } as ExtraModel
    ]).debounceTime(200).pipe(
      map((extras) => extras.sort((a, b) => b.id - a.id)),
      map((extras) => extras.map((extra) => ({...extra, obs: extra.obs || ''}))),
    );
  }

  resetAcceptClient(
    extraId: number,
    acceptClient: number,
    acceptClientDate: string,
  ) {
    const body = {
      id: extraId,
      accept_client: acceptClient,
      accept_client_date: acceptClientDate,
    };

    return this.http
      .put(`${API}/extra`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  saveObs(id: number, obs: string) {
    const body = {
      id,
      obs: obs,
    };

    return this.http
      .put(`${API}/extra`, JSON.stringify(body), new RequestOptions())
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  sendEmail(checkInId: number) {
    const body = {
      checkin_id: checkInId,
    };

    return this.http
      .post(
        `${API}/extra/email`,
        JSON.stringify(body),
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

  post(extra: ExtraModel): Observable<{
    message?: string,
    object?: ExtraModel
  }> {
    return this.http
      .post(
        `${API}/extra`,
        JSON.stringify(extra),
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });

    const response = {
      message: 'Sucesso',
      object: {...extra}
    };

    return of(response).debounceTime(200);
  }

  put(extra: ExtraModel): Observable<{
    message?: string,
    object?: ExtraModel
  }> {
    // return this.http
    //   .put(
    //     `${API}/extra`,
    //     JSON.stringify(extra),
    //     new RequestOptions()
    //   )
    //   .map((response) => response.json())
    //   .catch((err) => {
    //     this.snackBar.open(ErrorHandler.message(err), "", {
    //       duration: 3000,
    //     });

    //     return ErrorHandler.capture(err);
    //   });

    const response = {
      message: 'Sucesso',
      object: {...extra}
    };

    return of(response).debounceTime(200);
  }

  delete(extraId: number): Observable<any> {
    return this.http
      .delete(`${API}/extra/${extraId}`)
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
