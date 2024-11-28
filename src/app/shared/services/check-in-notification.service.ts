import { Injectable } from "@angular/core";
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material';
import { API } from 'app/app.api';
import { ErrorHandler } from '../error-handler.service';
import { Observable } from 'rxjs';
import { ProjectsPendency } from 'app/alerts/alerts.model';

@Injectable({
  providedIn: "root",
})
export class CheckInNotificationService {
  constructor(private http: Http, private snackBar: MatSnackBar) {}

  get(): Observable<ProjectsPendency> {
    return this.http
        .get(`${API}/notifyCheckinWindow`)
        .map((response) => response.json())
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), "", {
                duration: 3000,
            });

            return ErrorHandler.capture(err);
        });
  }

  hasNotifications(): Observable<boolean> {
    return this.http
        .get(`${API}/notifyCheckinWindow`)
        .map((response) => response.json())
        .map((response: ProjectsPendency) => response.update_pendency.count > 0)
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), "", {
                duration: 3000,
            });

            return ErrorHandler.capture(err);
        });
  }
}
