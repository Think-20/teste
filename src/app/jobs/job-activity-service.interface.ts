import { Observable } from 'rxjs/Observable';
import { JobActivityInterface } from "./job-activity.interface";

export interface JobActivityServiceInterface {
  getNextAvailableDate(date: string): Observable<any>;
  editAvailableDate(jobActivity: JobActivityInterface): Observable<any>;
}
