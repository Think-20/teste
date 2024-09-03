import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CheckInModel } from './check-in.model';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { ErrorHandler } from '../shared/error-handler.service';

@Injectable()
export class CheckInService {
    constructor(
        private snackBar: MatSnackBar,
    ) { }

  get(jobId: number): Observable<CheckInModel> {
    return of({
        id: 1,
        job_id: jobId,
        project: null,
        memorial: null,
        budget: null,
        alerts: {
            approval: {
                name: 'Ana Julia',
                date: '2024-05-24T10:05:00',
                marked: true
            },
            accept_proposal: {
                name: 'Pamela',
                marked: false
            },
            accept_production: {
                name: 'Ivanildo',
                marked: false
            },
            board_approval: {
                name: 'Ivanildo',
                marked: false
            }
        },
        promoter_name: 'Ford motors',
        promoter_changed_by: 'Ana Julia',
        promoter_changed_in: '2024-05-24T10:05:00',
        area: 150,
        config: 'Ilha',
        location: 'Rua D4',
        pavilion: 'Vermelho',
        event: {
            event_id: 1,
            event_name: 'Expo Center Norte',
            installation_date: '2024-06-30T00:00:00',
            event_date: '2024-07-03T00:00:00',
            dismantling_date: '2024-07-06T00:00:00',
            changed_by: 'Ana Julia',
            changed_in: '2024-05-24T10:05:00',
        },
        approval_note: 'Deixe bem alinhado com o cliente!!!',
        contacts_obs: null,
        billing_obs: null,
    } as CheckInModel)
        // .map(response => response.json())
        .catch((err) => {
            this.snackBar.open(ErrorHandler.message(err), '', {
                duration: 3000
            });

            return ErrorHandler.capture(err);
        })
        .pipe(delay(1000));
  }
}
