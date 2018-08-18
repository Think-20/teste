import { Observable } from 'rxjs/Observable';
import { JobActivityInterface } from "./job-activity.interface";

export interface JobActivityServiceInterface {
  getNextAvailableDate(availableDate: string, estimatedTime: number, swap: boolean): Observable<any>;
  editAvailableDate(jobActivity: JobActivityInterface): Observable<any>;
}
