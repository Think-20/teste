import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from '../../app/app.api';
import { Observable } from 'rxjs';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { EditStatus, ProjectStatus, ProjectsPendency } from './alerts.model';


@Injectable()
export class AlertService {

  status: ProjectStatus[] = [
    {
      id: 1,
      name: "Stand-by"
    },
    {
      id: 2,
      name: "Declinado"
    },
    {
      id: 3,
      name: "Aprovado"
    },
    {
      id: 4,
      name: "Reprovado"
    },
    {
      id: 5,
      name: "Negociação avançada"
    },
  ]

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
  ) { }

  getAlerts(): Observable<ProjectsPendency> {
    const url = `/notifywindow`

    return this.http.get(`${API}/${url}`)
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        })
        return ErrorHandler.capture(err)
      })
  }

  updateStatusProject(project: EditStatus): Observable<EditStatus> {
    const url = 'job/edit'

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(project),
      new RequestOptions()
  )
  .map(response => response.json())
  .catch((err) => {
      this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
      })
      return ErrorHandler.capture(err)
  })
}

  getStatus(): ProjectStatus[] {

    return this.status;
  }

}
