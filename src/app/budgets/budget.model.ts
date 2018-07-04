import { Employee } from "../employees/employee.model";

export class Budget {
  id: number
  available_date: string
  responsible_id: number
  responsible?: Employee
}
