import { Department } from '../department/department.model'
import { Position } from '../position/position.model'

export class Employee {
    id: number
    name: string
    payment: number
    department?: Department
    department_id?: number
    position?: Position
    position_id?: number
}
