import { City } from '../address/city.model';
import { Employee } from '../employees/employee.model';
import { ClientType } from './client-types/client-type.model';
import { ClientStatus } from './client-status/client-status.model';
import { Contact } from '../contacts/contact.model';
import { ClientComission } from './client-comission/client-comission.model';
import { State } from 'app/address/state.model';
import { Job } from 'app/jobs/job.model';

export class Client {
    id: number
    name: string
    fantasy_name: string
    cnpj: number
    ie: string;
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
    state?: State;
    city_id?: number;
    external: number
    cep: number
    employee?: Employee
    type?: ClientType
    status?: ClientStatus
    client_type?: ClientType;
    client_status?: ClientStatus;
    contacts?: Contact[]
    comission?: ClientComission
    created_at?: string
    updated_at?: string
    jobs?: Job[];
    logs?: [];
    client_status_id?: number;
    client_type_id?: number;
    comission_id?: number;
    employee_id?: number;
    external_toggle?: boolean;

    constructor() {
        this.mainphone = null;
    }
}
