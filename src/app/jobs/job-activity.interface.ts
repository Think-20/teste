import { Employee } from "../employees/employee.model";

export class JobActivityInterface {
  responsible?: Employee
  responsible_id: number
  available_date: string
}
