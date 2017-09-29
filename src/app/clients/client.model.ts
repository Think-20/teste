import { City } from '../address/city.model';
import { Employee } from '../employees/employee.model';
import { ClientType } from './client-types/client-type.model';
import { ClientStatus } from './client-status/client-status.model';
import { Contact } from '../contacts/contact.model';

export class Client {
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
    cep: number
    employee?: Employee
    type?: ClientType
    status?: ClientStatus
    contacts?: Contact[]
    created_at: string
    updated_at: string
}