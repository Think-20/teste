import { Employee } from "../employees/employee.model";
import { User } from "../user/user.model";

export class Timecard {
  id: number
  entry: string
  exit: string
  employee_id?: number
  employee?: Employee
  approved?: number
  approved_user?: User
  entryPlace?: string
  autoEntryPlaceCoordinates?: string
  autoEntryPlace?: string
  exitPlace?: string
  autoExitPlaceCoordinates?: string
  autoExitPlace?: string
}
