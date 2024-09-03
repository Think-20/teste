import { Task } from 'app/schedule/task.model';
import { AlertModel } from 'app/shared/models/alert.model';
import { EventModel } from 'app/shared/models/event.model';
import { OrganizationModel } from 'app/shared/models/organization.model';

export class CheckInModel {
    id?: number;
    job_id: number;
    project?: Task;
    memorial?: Task;
    budget?: Task;
    alerts?: {
        approval?: AlertModel;
        accept_proposal?: AlertModel;
        accept_production?: AlertModel;
        board_approval?: AlertModel;
    };
    area?: number;
    config?: string;
    location?: string;
    pavilion?: string;
    organization?: OrganizationModel;
    promoter_name?: string;
    promoter_login?: string;
    promoter_password?: string;
    promoter_changed_by?: string;
    promoter_changed_in?: string;
    event?: EventModel;
    approval_note?: string = null;
    contacts?: {
        clients?: {
            id: number;
            name: string;
            department: string;
            email: string;
            cellphone: string;
            landline: string;
            percentage: number;
        } [];
        agencies?: {
            id: number;
            name: string;
            department: string;
            email: string;
            cellphone: string;
            landline: string;
            percentage: number;
        } [];
    };
    contacts_obs?: string = null;
    billing_client_id?: number;
    costumer_service_employee: null;
    costumer_service_comission: null;
    costumer_service_employee2: null;
    costumer_service_comission2: null;
    creation_employee: null;
    creation_comission: null;
    creation_employee2: null;
    creation_comission2: null;
    production_manager_employee: null;
    production_manager_comission: null;
    production_manager_employee2: null;
    production_manager_comission2: null;
    budget_employee: null;
    budget_comission: null;
    budget_employee2: null;
    budget_comission2: null;
    detailing_employee: null;
    detailing_comission: null;
    detailing_employee2: null;
    detailing_comission2: null;
    production_employee: null;
    production_comission: null;
    production_employee2: null;
    production_comission2: null;
    billing_obs: string;
    billing_amount?: {
        billing_amount: number;
        value_base_for_calculation: number;
        bv: number;
        bv_customer_service: string;
        taxes: number;
        equipment: number;
        logistics: number;
        credentials_fees: number;
        insurance: number;
        others: number;
        discount: number;
        final_contract_value: number;
        payments?: {
            id: number;
            description: string;
            percentage: number;
            value: number;
            date: string;
            settlement_date: string;
            state: string;
        } [];
        approved_by: string;
        approved_at: string;
        discount_interest: number;
        total_amount_received: number;
        obs: string;
    };
    extras?: {
        total_amount_extras: number;
        items: {
            id: number;
            description: string;
            value: number;
            requester: string;
            budget: string;
        } [];
        extra_commissions: {
            id: number;
            approval_date: string;
            extra_commission: string;
            billing: string;
            date: string;
            due_date: string;
            settlement_date: string;
        } [];
        approved_by: string;
        approved_at: string;
        discount_interest: number;
        total_amount_extras_received: number;
        obs: string;
    };
}
