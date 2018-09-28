import { Department } from '../department/department.model'
import { Position } from '../position/position.model'
import { Notifiable } from 'app/notification-bar/notification/notification.model';

export class Employee implements Notifiable {
    id: number
    name: string
    image: string
    payment: number
    department?: Department
    department_id?: number
    position?: Position
    position_id?: number
}
