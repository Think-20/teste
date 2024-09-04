import { Employee } from 'app/employees/employee.model';
import { PersonModel } from './person.model';

export class ExtraModel {
    id?: number;
    checkin_id?: number;
    description?: string;
    value?: number;
    requester?: number;
    budget?: number;
    created_at?: string;
    updated_at?: string;
    requester_object?: PersonModel;
    budget_object?: Employee;
}