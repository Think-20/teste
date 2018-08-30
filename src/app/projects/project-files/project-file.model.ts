import { Task } from "../../schedule/task.model";
import { Employee } from "../../employees/employee.model";

export class ProjectFile {
  id: number
  responsible_id?: number
  responsible?: Employee
  task_id?: number
  task?: Task
  name: string
  original_name: string
  type: string
  created_at?: string
  updated_at?: string
}
