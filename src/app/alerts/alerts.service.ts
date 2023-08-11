import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'app/login/auth.service';
import { API } from '../../app/app.api';
import { Observable } from 'rxjs';
import { ErrorHandler } from 'app/shared/error-handler.service';


@Injectable()
export class AlertService {

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
    private auth: AuthService
  ) { }

  getAlerts(): Observable<any> {
    let url = `/reports`

    return this.http.get(`${API}/${url}`)
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

}
