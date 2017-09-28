import { Employee } from '../employees/employee.model'

export class User {
    id: number
    email: string
    password: string
    employeeId: number
    employee?: Employee
    functionalities?: Functionality[]
}

export class Functionality {
    id: number
    url: string
    description: string
}