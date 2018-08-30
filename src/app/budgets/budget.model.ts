import { Employee } from "../employees/employee.model";
import { Task } from "../schedule/task.model";

export class Budget {
  id: number
  responsible_id?: number
  responsible?: Employee
  task_id?: number
  task?: Task
  gross_value: number
  bv_value: number
  equipments_value: number
  logistics_value: number
  sales_commission_value: number
  tax_aliquot: number
  others_value: number
  discount_aliquot: number
  created_at?: string
  updated_at?: string
}
