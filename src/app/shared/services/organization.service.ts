import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../../app.api";
import { ErrorHandler } from "../error-handler.service";
import { OrganizationModel } from '../models/organization.model';

@Injectable()
export class OrganizationService {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  organizations(): Observable<OrganizationModel[]> {
    return this.http
      .get<OrganizationModel[]>(`${API}/organization`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }

  organization(organizationId: number): Observable<any> {
    return null;
  }

  save(organization: any): Observable<{
    message?: string,
    object?: OrganizationModel
  }> {
    return this.http
      .post(
        `${API}/organization`,
        JSON.stringify(organization),
        
      )
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", {
          duration: 3000,
        });

        return ErrorHandler.capture(err);
      });
  }
}
