import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from '../../app/app.api';
import { Observable } from 'rxjs';
import { ErrorHandler } from 'app/shared/error-handler.service';
import { MemoryGroup } from './memories.model';



@Injectable()
export class MemoriesService {

  constructor(
    private http: Http,
    private snackBar: MatSnackBar,
  ) { }

  getMemories(showOnlyUnread: boolean): Observable<MemoryGroup> {
    let url = `reminders`;

    if (showOnlyUnread) { // Verifica se o checkbox está marcado
      url += '?onlyNotRead=true'; // Adiciona a queryString para buscar apenas memórias não lidas
    }

    return this.http.get(`${API}/${url}`)
      .map(response => response.json())
      .catch((err) => {
        this.snackBar.open(ErrorHandler.message(err), '', {
          duration: 3000
        });
        return ErrorHandler.capture(err);
      });
  }

  updateReadMemory(id: number): Observable<string> {
    const url = `reminders/read/${id}`

    return this.http.put(
      `${API}/${url}`,
      JSON.stringify(id),
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

  checkUnreadMemories(): Observable<boolean> {
    return this.getMemories(true).map(memories => {

      for (const groupName in memories) {
        if (memories.hasOwnProperty(groupName)) {
          const group = memories[groupName];
          const unreadMemory = group.find(memory => memory.read === 0);
          if (unreadMemory) {
            return true;
          }
        }
      }
      return false;
    });
  }
}
