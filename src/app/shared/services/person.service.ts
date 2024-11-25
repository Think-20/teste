import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../../app.api";
import { ErrorHandler } from "../error-handler.service";
import { PersonModel } from '../models/person.model';

@Injectable()
export class PersonService {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  persons(): Observable<PersonModel[]> {
    return this.http
      .get<PersonModel[]>(`${API}/person`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  save(person: any): Observable<{
    message?: string,
    object?: PersonModel
  }> {
    return this.http
      .post(
        `${API}/person`,
        JSON.stringify(person),
        
      )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
