import { Employee } from 'app/employees/employee.model';
import { PersonModel } from './person.model';

export class ExtraItemModel {
    id?: number;
    extra_id?: number;
    description?: string;
    value?: number;
    quantity?: number;
    requester?: number;
    budget?: number;
    approval_date?: string;
    extra_commission?: string;
    billing_employee_id?: number;
    date?: string;
    due_date?: string;
    settlement_date?: string;
    created_at?: string;
    updated_at?: string;
    requester_object?: PersonModel;
    budget_object?: Employee;
}