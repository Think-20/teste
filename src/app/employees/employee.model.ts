import { Department } from '../department/department.model'
import { Position } from '../position/position.model'

export class Employee {
    id: number
    name: string
    payment: number
    department?: Department
    position?: Position
}