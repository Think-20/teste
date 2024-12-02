import { Injectable } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { MatSnackBar } from "@angular/material/snack-bar";

import { Observable } from "rxjs/Observable";

import { API } from "../../app.api";
import { ErrorHandler } from "../error-handler.service";
import { OrganizationModel } from "../models/organization.model";

@Injectable()
export class OrganizationService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  organizations(): Observable<OrganizationModel[]> {
    return this.http
      .get(`${API}/organization`)
      .map((response) => response.json())
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

  post(organization: OrganizationModel): Observable<{
    message?: string;
    object?: OrganizationModel;
  }> {
    return this.http
      .post(
        `${API}/organization`,
        JSON.stringify(organization),
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

  put(organization: OrganizationModel): Observable<{
    message?: string;
    object?: OrganizationModel;
  }> {
    return this.http
      .put(
        `${API}/organization`,
        JSON.stringify(organization),
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

  delete(organizationId: number): Observable<{
    message?: string;
    status?: string;
  }> {
    return this.http
      .delete(
        `${API}/organization/${organizationId}`,
        new RequestOptions()
      )
      .map((response) => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), "", { duration: 3000 });

        return ErrorHandler.capture(err);
      });
  }
}
