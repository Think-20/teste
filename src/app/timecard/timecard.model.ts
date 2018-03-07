import { Employee } from "../employees/employee.model";

export class Timecard {
  id: number
  entry: string
  exit: string
  employee_id?: number
  employee?: Employee
}
