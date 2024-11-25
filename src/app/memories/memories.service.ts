import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from '../../app/app.api';
import { Observable } from 'rxjs';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { Memory } from './memories.model';



@Injectable()
export class MemoriesService {

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) { }

  getMemories(): Observable<any> {
    let url = `reminders`;

    return this.http.get(`${API}/${url}`)
      
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        });
        return ErrorHandler.capture(err);
      });
  }

  updateReadMemory(id: number): Observable<any> {
    const url = `reminders/read/${id}`

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(id),
      
    )
    
    .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
            duration: 3000
        })
        return ErrorHandler.capture(err)
    })
  }

}
