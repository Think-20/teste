import { Employee } from '../employees/employee.model'

export class User {
    id: number
    email: string
    password: string
    employee?: Employee
    functionalities?: Functionality[]
}

export class Functionality {
    id: number
    url: string
    description: string
}