import { City } from '../address/city.model';
import { Employee } from '../employees/employee.model';
import { Contact } from '../contacts/contact.model';

export class Event {
    id: number
    name: string
    fantasy_name: string
    cnpj: number
    mainphone: number
    secundaryphone: number
    site: string
    rate: number
    note: string
    street: string
    number: number
    neighborhood: string
    complement?: string
    city?: City
    external: number
    cep: number
    employee?: Employee
    contacts?: Contact[]
    created_at: string
    updated_at: string
}
