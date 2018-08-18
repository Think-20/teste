import { Employee } from '../employees/employee.model'
import { Notifiable } from '../notification-bar/notification/notification.model';

export class User implements Notifiable {
  id: number
  email: string
  password: string
  employee?: Employee
  functionalities?: Functionality[]
  displays: Display[]
  coordinatesNow ?: string

  getName(): string {
    return this.employee.name
  }

  getEmployee(): Employee {
    return this.employee
  }

  hasEmployee(): boolean {
    return true
  }
}

export class Functionality {
    id: number
    url: string
    description: string
}

export class Display {
    url: string
    access: string
}
