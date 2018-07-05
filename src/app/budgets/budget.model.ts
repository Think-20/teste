import { Employee } from "../employees/employee.model";
import { JobActivityInterface } from "../jobs/job-activity.interface";

export class Budget implements JobActivityInterface {
  id: number
  available_date: string
  responsible_id: number
  responsible?: Employee
}
